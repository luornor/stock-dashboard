from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from .models import Ticker, PriceSnapshot
from .serializers import LatestQuoteSerializer
import os, json, redis

r = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))


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
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def historical(request):
    symbol = request.GET.get("symbol")
    # range param optional — keep simple for now
    t = Ticker.objects.get(symbol=symbol)
    qs = PriceSnapshot.objects.filter(ticker=t).order_by("ts") \
        .values("ts","open","high","low","close","volume")
    return Response(list(qs))
