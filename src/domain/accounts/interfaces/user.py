from typing import Protocol

from src.domain.accounts.schemas.user import UsersSchemaAuth, UsersSchemaAdd, TokenJWT


class UserRepositoryProtocol(Protocol):
    async def get_by_username(self, username: str) -> UsersSchemaAuth | None: ...

    async def create_user(self, user: UsersSchemaAuth) -> UsersSchemaAuth: ...

    async def get_by_email(self, email: str) -> UsersSchemaAuth | None: ...



class UserServiceProtocol(Protocol):
    async def register_user(self, user_in: UsersSchemaAdd) -> TokenJWT: ...

    async def get_by_email(self, email: str) -> UsersSchemaAuth | None: ...
