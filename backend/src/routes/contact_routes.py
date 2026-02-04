from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from ..controllers.contact_controller import (
    create_contact,
    delete_contact,
    get_contact,
    list_contacts,
    toggle_favorite,
    update_contact,
)
from ..middleware.auth_middleware import get_current_user
from ..models.schemas import ContactCreate, ContactOut, ContactUpdate

router = APIRouter()


@router.post("/", response_model=ContactOut)
def add_contact(
    payload: ContactCreate, current_user: dict = Depends(get_current_user)
):
    return create_contact(current_user["_id"], payload)


@router.get("/", response_model=List[ContactOut])
def get_contacts(
    search: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    favorite: Optional[bool] = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    return list_contacts(
        user_id=current_user["_id"],
        search=search,
        tag=tag,
        favorite=favorite,
    )


@router.get("/{contact_id}", response_model=ContactOut)
def get_single_contact(
    contact_id: str, current_user: dict = Depends(get_current_user)
):
    return get_contact(current_user["_id"], contact_id)


@router.put("/{contact_id}", response_model=ContactOut)
def update_single_contact(
    contact_id: str,
    payload: ContactUpdate,
    current_user: dict = Depends(get_current_user),
):
    return update_contact(current_user["_id"], contact_id, payload)


@router.delete("/{contact_id}")
def delete_single_contact(
    contact_id: str, current_user: dict = Depends(get_current_user)
):
    delete_contact(current_user["_id"], contact_id)
    return {"status": "deleted"}


@router.patch("/{contact_id}/favorite", response_model=ContactOut)
def toggle_favorite_contact(
    contact_id: str, current_user: dict = Depends(get_current_user)
):
    return toggle_favorite(current_user["_id"], contact_id)

