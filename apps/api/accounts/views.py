# Create your views here.
import os
from google.oauth2 import id_token
from google.auth.transport import requests as g_requests
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.crypto import get_random_string

User = get_user_model()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def issue_tokens(user: User):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}

@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    """
    Body: { "id_token": "<Google ID token>" }
    Verifies the ID token with Google, upserts user, returns your JWT pair.
    """
    try:
        token = request.data.get("id_token")
        if not token:
            return Response({"detail": "id_token missing"}, status=400)

        info = id_token.verify_oauth2_token(token, g_requests.Request(), GOOGLE_CLIENT_ID)
        # info contains: sub, email, email_verified, picture, given_name, family_name, etc.
        if info.get("aud") != GOOGLE_CLIENT_ID:
            return Response({"detail": "Invalid audience"}, status=401)

        if not info.get("email_verified", False):
            return Response({"detail": "Email not verified with Google"}, status=401)

        email = info["email"].lower()
        sub   = info["sub"]
        first = info.get("given_name", "")
        last  = info.get("family_name", "")
        avatar= info.get("picture", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0] + "_" + get_random_string(4),
                "first_name": first,
                "last_name": last,
                "google_sub": sub,
            },
        )
        # If existing but google_sub was empty, backfill (first Google login)
        if user.google_sub is None:
            user.google_sub = sub
        # Update avatar/name if Google provides
        if avatar:
            user.avatar_url = avatar
        if first and not user.first_name: user.first_name = first
        if last and not user.last_name: user.last_name = last
        user.set_unusable_password()  # ensure no usable password
        user.save()

        return Response({"user": {
            "id": user.id, "email": user.email, "first_name": user.first_name,
            "last_name": user.last_name, "avatar_url": user.avatar_url
        }, **issue_tokens(user)}, status=200)

    except ValueError:
        return Response({"detail": "Invalid ID token"}, status=401)
    except Exception as e:
        return Response({"detail": f"Auth failed: {e}"}, status=500)
