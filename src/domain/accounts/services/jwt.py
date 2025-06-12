from datetime import timedelta, datetime, timezone

from jose import jwt

from src.settings import settings


class JWTService:
    """Кодирует и декодирует JWT, выбрасывая HTTP_401 при ошибке."""

    def __init__(self, secret_key: str = settings.jwt.secret_key,
                 algorithm: str = settings.jwt.algorithm,
                 expire_minutes: int = settings.jwt.expire_minutes):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expire_minutes = expire_minutes

    def encode_jwt(
            self,
            payload: dict,
            expire_timedelta: timedelta | None = None,
    ) -> str:
        to_encode = payload.copy()
        now = datetime.now(timezone.utc)
        if expire_timedelta:
            expire = now + expire_timedelta
        else:
            expire = now + timedelta(minutes=self.expire_minutes)
        to_encode.update(
            exp=expire,
            iat=now,
        )
        encoded = jwt.encode(
            to_encode,
            self.secret_key,
            algorithm=self.algorithm,
        )
        return encoded

    def decode_jwt(
            self,
            token: str | bytes,
    ) -> dict:
        decoded = jwt.decode(
            token,
            self.secret_key,
            algorithms=[self.algorithm],
        )
        return decoded
