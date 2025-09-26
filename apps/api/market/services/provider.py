from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
import datetime as dt
from typing import Optional, Dict, Any

@dataclass
class Bar:
    ts: dt.datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int

class MarketDataProvider(ABC):
    @abstractmethod
    def latest_intraday(self, symbol: str) -> Optional[Bar]:
        ...

    @abstractmethod
    def latest_daily(self, symbol: str) -> Optional[Bar]:
        ...
