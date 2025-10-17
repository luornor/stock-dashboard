# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone

class Ticker(models.Model):
    symbol = models.CharField(max_length=12, unique=True)
    name = models.CharField(max_length=128, blank=True)
    exchange = models.CharField(max_length=64, blank=True)
    currency = models.CharField(max_length=8, default="USD")
    is_active = models.BooleanField(default=True)
    def __str__(self): return self.symbol

class Watchlist(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

class WatchlistItem(models.Model):
    watchlist = models.ForeignKey(Watchlist, related_name="items", on_delete=models.CASCADE)
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    notes = models.CharField(max_length=140, blank=True)
    class Meta:
        unique_together = (("watchlist", "ticker"),)

class PriceSnapshot(models.Model):
    ticker = models.ForeignKey(Ticker, on_delete=models.CASCADE)
    ts = models.DateTimeField(db_index=True)
    open = models.DecimalField(max_digits=12, decimal_places=4)
    high = models.DecimalField(max_digits=12, decimal_places=4)
    low = models.DecimalField(max_digits=12, decimal_places=4)
    close = models.DecimalField(max_digits=12, decimal_places=4)
    volume = models.BigIntegerField()
    class Meta:
        unique_together = (("ticker", "ts"),)
        indexes = [models.Index(fields=["ticker", "ts"])]



class Alert(models.Model):
    # Types of alerts
    ABOVE = "ABOVE"
    BELOW = "BELOW"
    PCT_UP = "PCT_UP"
    PCT_DOWN = "PCT_DOWN"
    KIND_CHOICES = [
        (ABOVE, "Crosses Above"),
        (BELOW, "Crosses Below"),
        (PCT_UP, "Percent Up"),
        (PCT_DOWN, "Percent Down"),
    ]

    # What reference price to use for % alerts (you can extend later)
    PREV_CLOSE = "PREV_CLOSE"
    SESSION_OPEN = "SESSION_OPEN"
    REF_CHOICES = [
        (PREV_CLOSE, "Previous Close"),
        (SESSION_OPEN, "Session Open"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alerts")
    ticker = models.ForeignKey("Ticker", on_delete=models.CASCADE, related_name="alerts")
    kind = models.CharField(max_length=16, choices=KIND_CHOICES)
    # For ABOVE/BELOW: absolute price (e.g., 250.00)
    # For PCT_*: percent value (e.g., 5.0 for +5%)
    threshold = models.DecimalField(max_digits=12, decimal_places=4)

    # For PCT_* alerts only — which baseline to compare against
    reference = models.CharField(
        max_length=16, choices=REF_CHOICES, default=PREV_CLOSE
    )

    # Activation & lifecycle
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "ticker", "is_active"]),
            models.Index(fields=["ticker", "kind", "is_active"]),
        ]
        constraints = [
            # avoid exact duplicates per user
            models.UniqueConstraint(
                fields=["user", "ticker", "kind", "threshold", "reference"],
                name="uniq_user_ticker_kind_threshold_reference",
            )
        ]

    def mark_triggered(self):
        self.triggered_at = timezone.now()
        self.is_active = False
        self.save(update_fields=["triggered_at", "is_active"])

    def __str__(self):
        return f"{self.user_id}:{self.ticker.symbol} {self.kind} {self.threshold}"


class AlertEvent(models.Model):
    """Keeps a history of alert triggers (useful for UI & audits)."""
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="events")
    triggered_at = models.DateTimeField(default=timezone.now)
    last_price = models.DecimalField(max_digits=12, decimal_places=4)
    note = models.CharField(max_length=140, blank=True)

    class Meta:
        indexes = [models.Index(fields=["triggered_at"])]
        ordering = ["-triggered_at"]

    def __str__(self):
        return f"{self.alert} @ {self.last_price} on {self.triggered_at}"
