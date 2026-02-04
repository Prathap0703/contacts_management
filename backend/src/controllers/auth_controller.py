from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from pymongo.errors import PyMongoError

from ..config.database import users_collection
from ..config.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)
from ..models.schemas import Token, UserCreate, UserLogin, UserOut


def register_user(payload: UserCreate) -> UserOut:
    try:
        existing = users_collection.find_one({"email": str(payload.email).lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        now = datetime.now(timezone.utc)
        user_doc = {
            "_id": str(payload.email).lower(),  # simple unique id based on email
            "email": str(payload.email).lower(),
            "name": payload.name,
            "passwordHash": get_password_hash(payload.password),
            "createdAt": now,
        }
        users_collection.insert_one(user_doc)

        return UserOut(
            id=user_doc["_id"],
            email=user_doc["email"],
            name=user_doc.get("name"),
            createdAt=user_doc["createdAt"],
        )
    except PyMongoError:
        # Clear message for student-level debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error. Please make sure MongoDB is running and MONGODB_URI is correct.",
        )


def login_user(payload: UserLogin) -> Token:
    user = users_collection.find_one({"email": str(payload.email).lower()})
    if not user or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"]}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token)


def get_me(user: dict) -> UserOut:
    return UserOut(
        id=user["_id"],
        email=user["email"],
        name=user.get("name"),
        createdAt=user.get("createdAt"),
    )

