import json, os, datetime as dt
from decimal import Decimal, InvalidOperation
from celery import shared_task
import redis
from django.utils import timezone
from .models import Ticker, PriceSnapshot, Alert
from .services.alpha_vantage import AVClient, HardLimit
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging
log = logging.getLogger(__name__)

r = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))


def cache_key(symbol): 
    return f"quote:{symbol}"

def _parse_bar(ts_str, bar):
    ts_utc = dt.datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=dt.timezone.utc)
    return {
        "ts": ts_utc,
        "open": Decimal(bar["1. open"]),
        "high": Decimal(bar["2. high"]),
        "low":  Decimal(bar["3. low"]),
        "close": Decimal(bar["4. close"]),
        "volume": int(bar.get("5. volume", 0)),
    }

# market/tasks.py (replace poll_symbol with this safer version)
@shared_task(bind=True, rate_limit="4/m",  # <= free-tier comfort
             autoretry_for=(RuntimeError,), retry_backoff=True,
             retry_backoff_max=60, retry_jitter=True, max_retries=3)
def poll_symbol(self, symbol: str):
    av = AVClient()

    # Try intraday (5min) first
    series = None
    try:
        intr = av.intraday(symbol, interval="5min", adjusted=False) or {}
        series = intr.get("Time Series (5min)")
    except Exception as e:
        series = None
        
    except HardLimit as hl:
        # Log and gracefully stop; leave last good cache in Redis
        log.warning("Provider daily limit reached: %s", hl)
        return None

    bar = None
    if series:
        try:
            latest_ts = max(series.keys())
            b = series[latest_ts]
            ts_utc = dt.datetime.strptime(latest_ts, "%Y-%m-%d %H:%M:%S").replace(tzinfo=dt.timezone.utc)
            bar = {
                "ts": ts_utc,
                "open": Decimal(b["1. open"]), "high": Decimal(b["2. high"]),
                "low": Decimal(b["3. low"]), "close": Decimal(b["4. close"]),
                "volume": int(b.get("5. volume", 0)),
            }
        except Exception as e:
            raise RuntimeError(f"Malformed intraday payload for {symbol}: {e}")

    # Fallback to free DAILY if intraday missing/limited
    if bar is None:
        daily = av.daily(symbol) or {}
        ds = daily.get("Time Series (Daily)") or {}
        if not ds:
            # No data at all → bail and retry later
            raise RuntimeError(f"No free series available for {symbol}")
        latest_ts = max(ds.keys())
        b = ds[latest_ts]
        ts_utc = dt.datetime.strptime(latest_ts, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
        bar = {
            "ts": ts_utc,
            "open": Decimal(b["1. open"]), "high": Decimal(b["2. high"]),
            "low": Decimal(b["3. low"]), "close": Decimal(b["4. close"]),
            "volume": int(b.get("6. volume", b.get("5. volume", 0))),
        }

    payload = {
        "symbol": symbol,
        "price": float(bar["close"]),
        "ts": bar["ts"].isoformat(),
        "open": float(bar["open"]),
        "high": float(bar["high"]),
        "low": float(bar["low"]),
        "volume": bar["volume"],
    }
    r.setex(cache_key(symbol), 20, json.dumps(payload))


    # broadcast to WS clients
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "quotes",
            {"type": "quote.update", "payload": payload}
        )
    except Exception:
        pass  # don't fail the task if WS layer isn't available

    try:
        t = Ticker.objects.get(symbol=symbol)
        PriceSnapshot.objects.get_or_create(
            ticker=t, ts=bar["ts"],
            defaults={"open": bar["open"], "high": bar["high"], "low": bar["low"],
                      "close": bar["close"], "volume": bar["volume"]},
        )
    except Ticker.DoesNotExist:
        pass

    return payload


POPULAR = ["AAPL","MSFT","GOOGL","AMZN"]  # keep it small on free tier

@shared_task
def poll_popular_tickers():
    for i, s in enumerate(POPULAR):
        poll_symbol.apply_async(args=[s], countdown=i * 20)  # 20s spacing


@shared_task
def scan_alerts():
    active = Alert.objects.filter(is_active=True, triggered_at__isnull=True).select_related("ticker")
    now = timezone.now()
    for a in active:
        raw = r.get(cache_key(a.ticker.symbol))
        if not raw:
            continue
        price = float(json.loads(raw).get("price", 0.0))
        trig = (a.kind == Alert.ABOVE and price >= float(a.threshold)) or \
               (a.kind == Alert.BELOW and price <= float(a.threshold))
        if trig:
            a.triggered_at = now
            a.save(update_fields=["triggered_at"])
