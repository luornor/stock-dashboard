from django.core.management.base import BaseCommand
from market.models import Ticker, PriceSnapshot
from market.services.alpha_vantage import AVClient
from decimal import Decimal, InvalidOperation
import datetime as dt

class Command(BaseCommand):
    help = "Backfill last N days of daily candles for a symbol (default: 30)."

    def add_arguments(self, parser):
        parser.add_argument("symbol", help="Ticker symbol, e.g. AMZN")
        parser.add_argument("--days", type=int, default=30, help="Number of most recent days to backfill (default 30)")

    def handle(self, *args, **options):
        symbol = (options["symbol"] or "").upper().strip()
        days = int(options["days"] or 30)
        if not symbol:
            self.stderr.write(self.style.ERROR("Symbol is required"))
            return

        # Ensure ticker row exists
        ticker, _ = Ticker.objects.get_or_create(symbol=symbol)

        av = AVClient()
        data = av.daily(symbol) or {}
        series = data.get("Time Series (Daily)") or {}
        if not series:
            self.stderr.write(self.style.ERROR(f"No daily series for {symbol}"))
            return

        inserted = 0
        # Fill newest first but keep order deterministic
        for k in sorted(series.keys())[-days:]:
            bar = series.get(k) or {}
            try:
                ts = dt.datetime.strptime(k, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
                o = Decimal(bar["1. open"])
                h = Decimal(bar["2. high"])
                l = Decimal(bar["3. low"])
                c = Decimal(bar["4. close"])
                v = int(bar.get("6. volume", bar.get("5. volume", 0)))
            except (KeyError, InvalidOperation, ValueError) as e:
                self.stderr.write(self.style.WARNING(f"Skip {k}: malformed bar ({e})"))
                continue

            _, created = PriceSnapshot.objects.get_or_create(
                ticker=ticker, ts=ts,
                defaults={"open": o, "high": h, "low": l, "close": c, "volume": v},
            )
            inserted += int(created)

        self.stdout.write(self.style.SUCCESS(f"{symbol}: backfilled {inserted} bars (last {days} days)"))
