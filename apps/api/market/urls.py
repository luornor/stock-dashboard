from django.urls import path, include
from market.views import latest_quotes, historical

urlpatterns = [
    path("quotes/latest", latest_quotes),
    path("quotes/historical", historical),
]
