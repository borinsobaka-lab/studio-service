import hashlib
import hmac
import json
import base64
import time
from datetime import timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(BaseModel):
    token: str


def _create_token(payload: dict, secret: str) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).hexdigest()
    return f"{header}.{body}.{sig}"


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    if req.login != settings.AUTH_LOGIN or req.password != settings.AUTH_PASSWORD:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    exp = int(time.time()) + int(timedelta(hours=24).total_seconds())
    token = _create_token({"sub": req.login, "exp": exp}, settings.JWT_SECRET)
    return LoginResponse(token=token)
