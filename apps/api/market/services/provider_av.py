import datetime as dt
from decimal import Decimal
from .provider import MarketDataProvider, Bar
from .alpha_vantage import AVClient, HardLimit

class AlphaVantageProvider(MarketDataProvider):
    def __init__(self): self.av = AVClient()

    def latest_intraday(self, symbol: str):
        try:
            d = self.av.intraday(symbol, interval="5min", adjusted=False) or {}
            series = d.get("Time Series (5min)") or {}
            if not series: return None
            k = max(series.keys())
            b = series[k]
            ts = dt.datetime.strptime(k, "%Y-%m-%d %H:%M:%S").replace(tzinfo=dt.timezone.utc)
            return Bar(ts, Decimal(b["1. open"]), Decimal(b["2. high"]), Decimal(b["3. low"]),
                       Decimal(b["4. close"]), int(b.get("5. volume", 0)))
        except HardLimit:
            raise
        except Exception:
            return None

    def latest_daily(self, symbol: str):
        try:
            d = self.av.daily(symbol) or {}
            series = d.get("Time Series (Daily)") or {}
            if not series: return None
            k = max(series.keys())
            b = series[k]
            ts = dt.datetime.strptime(k, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
            return Bar(ts, Decimal(b["1. open"]), Decimal(b["2. high"]), Decimal(b["3. low"]),
                       Decimal(b["4. close"]), int(b.get("6. volume", b.get("5. volume", 0))))
        except HardLimit:
            raise
        except Exception:
            return None
