from django.urls import re_path
from market.consumers import QuotesConsumer

websocket_urlpatterns = [
    re_path(r"^ws/quotes/(?P<user_id>\d+)/$", QuotesConsumer.as_asgi()),
]
