# services/alpha_vantage.py
import os, time, requests, logging
log = logging.getLogger(__name__)
# add a custom exception at top of file
class HardLimit(Exception):
    """Non-retryable provider limit (e.g., daily quota)."""
    pass


class AVClient:
    BASE = "https://www.alphavantage.co/query"
    KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

    def _get(self, params: dict):
        if not self.KEY:
            raise RuntimeError("ALPHA_VANTAGE_API_KEY missing.")
        params["apikey"] = self.KEY
        r = requests.get(self.BASE, params=params, timeout=20)
        if r.status_code == 429:
            time.sleep(15)
        r.raise_for_status()
        data = r.json()

        # Alpha Vantage “soft errors”
        if "Information" in data:
            # This is a non-retryable daily limit / premium notice
            raise HardLimit(data["Information"])
        if "Error Message" in data:
            raise RuntimeError(f"AlphaVantage Error: {data['Error Message']}")
        if "Note" in data:
            log.warning("Alpha Vantage rate-limit Note: %s", data["Note"][:200])
            return {}  # caller decides to retry/fallback
        return data

    def intraday(self, symbol: str, interval: str = "5min", adjusted: bool = False):
        # 1min may also be premium/strictly limited—prefer 5min on free tier
        return self._get({
            "function": "TIME_SERIES_INTRADAY",
            "symbol": symbol,
            "interval": interval,
            "adjusted": "true" if adjusted else "false",
            "outputsize": "compact",
        })

    def daily(self, symbol: str):
        # free (non-adjusted) daily candles
        return self._get({
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "compact",
        })
