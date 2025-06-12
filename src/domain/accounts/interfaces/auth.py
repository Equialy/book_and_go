from datetime import timedelta
from typing import Protocol

from fastapi import Form

from src.domain.accounts.schemas.user import UsersSchemaAuth


class AuthServiceProtocol(Protocol):


    def encode_jwt(self, payload: dict, expire_timedelta: timedelta | None = None) -> str:
        ...

    def decode_jwt(self, token: str) -> dict:
        ...

    async def validate_auth_user(self, email: str = Form(), password: str = Form()) -> UsersSchemaAuth:
        ...




class PasswordManagerProtocol(Protocol):

    def hash_password(
            self,
            password: str,
    ) -> str: ...

    def validate_password(
            self,
            password: str,
            hashed_password: str,
    ) -> bool: ...


class JWTServiceProtocol(Protocol):
    def encode_jwt(
            self,
            payload: dict,
            expire_timedelta: timedelta | None = None,
    ) -> str: ...

    def decode_jwt(
            self,
            token: str | bytes,
    ) -> dict: ...
