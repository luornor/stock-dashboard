from rest_framework import serializers

class LatestQuoteSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    ts = serializers.CharField()
    open = serializers.FloatField()
    high = serializers.FloatField()
    low = serializers.FloatField()
    close = serializers.FloatField()
    volume = serializers.IntegerField()
