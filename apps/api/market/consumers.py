import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class QuotesConsumer(AsyncJsonWebsocketConsumer):
    group = "quotes"

    async def connect(self):
        # TODO: add JWT auth gate if you want to protect (optional for dev)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    # handler for events from channel layer
    async def quote_update(self, event):
        await self.send_json(event["payload"])
