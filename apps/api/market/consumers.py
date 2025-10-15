# apps/api/market/consumers.py
import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class QuotesConsumer(AsyncJsonWebsocketConsumer):
    group = "quotes"  # you can later use per-user/per-symbol groups

    async def connect(self):
        # Read JWT from query string: ?token=<jwt>
        qs = parse_qs(self.scope.get("query_string", b"").decode())
        token = (qs.get("token") or [None])[0]

        try:
            UntypedToken(token)  # validates signature & expiry
        except (InvalidToken, TokenError, TypeError):
            await self.close(code=4401)  # unauthorized
            return

        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def quote_update(self, event):
        await self.send_json(event["payload"])
