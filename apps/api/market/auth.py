from django.contrib.auth import get_user_model
from django.conf import settings
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import jwt

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    return User.objects.get(id=user_id)

async def authenticate_scope(scope):
    # read token from query string
    query = parse_qs(scope.get("query_string", b"").decode())
    raw = (query.get("token") or [None])[0]
    if not raw:
        return None
    try:
        UntypedToken(raw)  # validates signature & expiry
        data = jwt.decode(raw, options={"verify_signature": False}, algorithms=["HS256"])
        uid = data.get("user_id")
        if not uid: return None
        return await get_user(uid)
    except (InvalidToken, TokenError, jwt.PyJWTError):
        return None
