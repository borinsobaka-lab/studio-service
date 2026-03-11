import hashlib
import hmac
import json
import base64
import time
from fastapi import HTTPException, Request
from config import settings


def _verify_token(token: str, secret: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token")
    header, body, sig = parts
    expected_sig = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        raise ValueError("Invalid signature")
    # Add padding
    padded = body + "=" * (4 - len(body) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded))
    if payload.get("exp", 0) < time.time():
        raise ValueError("Token expired")
    return payload


def require_auth(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    token = auth.split(" ", 1)[1]
    try:
        _verify_token(token, settings.JWT_SECRET)
    except ValueError:
        raise HTTPException(status_code=401, detail="Недействительный токен")
