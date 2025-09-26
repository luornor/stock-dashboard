from django.core.management.base import BaseCommand
from market.models import Ticker

DEFAULTS = [
    "AAPL","MSFT","GOOGL"]
class Command(BaseCommand):
    help = "Seed popular tickers"
    def handle(self, *args, **kwargs):
        for s in DEFAULTS:
            Ticker.objects.get_or_create(symbol=s)
        self.stdout.write(self.style.SUCCESS("Seeded tickers"))
