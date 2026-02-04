from fastapi import APIRouter, Depends

from ..controllers.auth_controller import get_me, login_user, register_user
from ..middleware.auth_middleware import get_current_user
from ..models.schemas import Token, UserCreate, UserLogin, UserOut

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(payload: UserCreate):
    return register_user(payload)


@router.post("/login", response_model=Token)
def login(payload: UserLogin):
    return login_user(payload)


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return get_me(current_user)

