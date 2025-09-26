from django.core.management.base import BaseCommand
from market.models import Ticker, PriceSnapshot
from market.services.alpha_vantage import AVClient
from decimal import Decimal
import datetime as dt

class Command(BaseCommand):
    help = "Backfill last 30 days daily candles for a symbol."

    def add_arguments(self, parser):
        parser.add_argument("symbol")

    def handle(self, symbol, **kwargs):
        av = AVClient()
        data = av.daily(symbol) or {}
        series = data.get("Time Series (Daily)") or {}
        if not series:
            self.stdout.write(self.style.ERROR("No daily series"))
            return

        count = 0
        for k in sorted(series.keys())[-30:]:
            b = series[k]
            ts = dt.datetime.strptime(k, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
            o,h,l,c = Decimal(b["1. open"]), Decimal(b["2. high"]), Decimal(b["3. low"]), Decimal(b["4. close"])
            v = int(b.get("6. volume", b.get("5. volume", 0)))
            tkr = Ticker.objects.get(symbol=symbol)
            _, created = PriceSnapshot.objects.get_or_create(
                ticker=tkr, ts=ts,
                defaults={"open": o, "high": h, "low": l, "close": c, "volume": v}
            )
            count += int(created)
        self.stdout.write(self.style.SUCCESS(f"Backfilled {count} bars for {symbol}"))
