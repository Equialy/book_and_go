import logging

from fastapi import APIRouter, Depends, Form

from src.domain.accounts.schemas.user import TokenJWT, UsersSchemaAdd, UsersSchemaAuth
from src.presentation.dependencies.authentication.user_dependecies import AuthService, UserService, \
    get_current_auth_user
from src.settings import settings

log = logging.getLogger(__name__)

router = APIRouter(prefix=settings.api.v1.prefix, tags=["JWT"])


@router.post("/login", response_model=TokenJWT)
async def auth_user_jwt(
        auth_service: AuthService,
        username: str = Form(...),
        password: str = Form(...),
) -> TokenJWT:
    username_as_email = username
    user = await auth_service.validate_auth_user(email=username_as_email, password=password)
    jwt_payload = {
        "sub": user.email,
        "username": user.username,
        "email": user.email
    }
    token = auth_service.encode_jwt(payload=jwt_payload)
    return TokenJWT(access_token=token, token_type="Bearer")


@router.post("/register", response_model=TokenJWT)
async def register_user(
        user_in: UsersSchemaAdd,
        use_case: UserService
) -> TokenJWT:
    return await use_case.register_user(user_in)


@router.get("/users/me")
async def auth_current_user(user: UsersSchemaAuth = Depends(get_current_auth_user)) -> dict[str, str]:
    return {
        "username": user.username,
        "email": user.email
    }
