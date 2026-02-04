from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: str
    createdAt: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ContactBase(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=6)
    email: EmailStr
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    isFavorite: bool = False


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    isFavorite: Optional[bool] = None


class ContactOut(ContactBase):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime

