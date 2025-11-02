from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from .models import Ticker, PriceSnapshot
from .serializers import LatestQuoteSerializer
import os, json, redis

r = redis.from_url(os.getenv("REDIS_URL"))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def latest_quotes(request):
    symbols = (request.GET.get("symbols") or "").split(",")
    out = []
    for raw in symbols:
        s = raw.strip().upper()
        if not s: 
            continue
        data = cache.get(f"quote:{s}")
        if data:
            out.append(data)
    return Response(LatestQuoteSerializer(out, many=True).data)
    

from rest_framework import status

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def historical(request):
    symbol = (request.GET.get("symbol") or "").upper().strip()
    if not symbol:
        return Response({"detail": "symbol is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure ticker exists (prevents DoesNotExist -> 500)
    t, _ = Ticker.objects.get_or_create(symbol=symbol)

    rows = list(
        PriceSnapshot.objects
        .filter(ticker=t)
        .order_by("ts")
        .values("ts", "open", "high", "low", "close", "volume")
    )

    # If no data yet, optionally trigger a background backfill (non-blocking)
    if not rows:
        try:
            from .tasks import backfill_daily
            backfill_daily.delay(symbol)   # safe if Celery running
        except Exception:
            pass

    return Response(rows, status=status.HTTP_200_OK)

