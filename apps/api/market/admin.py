from django.contrib import admin
from .models import Ticker, Watchlist, WatchlistItem, PriceSnapshot, Alert, AlertEvent

@admin.register(Ticker)
class TickerAdmin(admin.ModelAdmin):
    list_display = ("symbol", "name", "exchange", "currency", "is_active")
    search_fields = ("symbol", "name")

@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "title", "created_at")
    search_fields = ("title", "owner__email")

@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ("watchlist", "ticker", "notes")

@admin.register(PriceSnapshot)
class PriceSnapshotAdmin(admin.ModelAdmin):
    list_display = ("ticker", "ts", "open", "high", "low", "close", "volume")
    list_filter = ("ticker",)

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("user", "ticker", "kind", "threshold", "reference", "is_active", "triggered_at", "created_at")
    list_filter = ("kind", "reference", "is_active", "ticker")
    search_fields = ("user__email", "ticker__symbol")

@admin.register(AlertEvent)
class AlertEventAdmin(admin.ModelAdmin):
    list_display = ("alert", "triggered_at", "last_price", "note")
    list_filter = ("triggered_at",)
