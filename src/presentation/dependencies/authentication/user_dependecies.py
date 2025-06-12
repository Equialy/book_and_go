import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.accounts.interfaces.auth import AuthServiceProtocol
from src.domain.accounts.interfaces.user import UserRepositoryProtocol, UserServiceProtocol
from src.domain.accounts.schemas.user import UsersSchemaAuth
from src.domain.accounts.services.auth_service import AuthServiceImpl
from src.domain.accounts.services.jwt import JWTService
from src.domain.accounts.services.password_manager import PasswordManagerImpl
from src.domain.accounts.services.schema_auth import oauth2_schema
from src.domain.accounts.services.user_use_cases import UserServiceImpl
from src.infrastructure.database.base import get_async_session
from src.infrastructure.database.repositories.user_repository import UserRepositoryImpl

log = logging.getLogger(__name__)

Session = Annotated[AsyncSession, Depends(get_async_session)]

# --- repositories ---

def get_user_repository(session: Session) -> UserRepositoryProtocol:
    return UserRepositoryImpl(session)


UsersFactoryRepository = Annotated[UserRepositoryProtocol, Depends(get_user_repository)]


# --- services ---

def get_user_service(user_factory_repository: UsersFactoryRepository) -> UserServiceProtocol:
    return  UserServiceImpl(user_factory_repository, PasswordManagerImpl(), JWTService())

UserService = Annotated[UserServiceProtocol, Depends(get_user_service)]


def get_auth_service(auth_factory_repositories: UsersFactoryRepository ) :
    return AuthServiceImpl(auth_factory_repositories, PasswordManagerImpl(), JWTService())



AuthService = Annotated[AuthServiceProtocol, Depends(get_auth_service)]


async def get_current_auth_user(auth_service: AuthService, user_service: UserService, token: str = Depends(oauth2_schema)) -> UsersSchemaAuth:
    payload = auth_service.decode_jwt(token)
    email = payload.get("sub")
    user = await user_service.get_by_email(email=email)
    # if not user:
    #     raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="token invalid")
    return user
