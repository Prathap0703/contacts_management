from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from pymongo import ReturnDocument
from uuid import uuid4

from ..config.database import contacts_collection
from ..models.schemas import ContactCreate, ContactOut, ContactUpdate


def _contact_to_out(doc: dict) -> ContactOut:
    return ContactOut(
        id=str(doc["_id"]),
        userId=str(doc["userId"]),
        name=doc["name"],
        phone=doc["phone"],
        email=doc["email"],
        notes=doc.get("notes"),
        tags=doc.get("tags") or [],
        isFavorite=doc.get("isFavorite", False),
        createdAt=doc.get("createdAt"),
        updatedAt=doc.get("updatedAt"),
    )


def create_contact(user_id: str, payload: ContactCreate) -> ContactOut:
    now = datetime.now(timezone.utc)
    doc = {
        "_id": str(uuid4()),
        "userId": user_id,
        "name": payload.name,
        "phone": payload.phone,
        "email": str(payload.email),
        "notes": payload.notes,
        "tags": payload.tags or [],
        "isFavorite": payload.isFavorite,
        "createdAt": now,
        "updatedAt": now,
    }
    contacts_collection.insert_one(doc)
    return _contact_to_out(doc)


def list_contacts(
    user_id: str,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    favorite: Optional[bool] = None,
) -> List[ContactOut]:
    query: dict = {"userId": user_id}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    if tag:
        query["tags"] = tag

    if favorite is not None:
        query["isFavorite"] = favorite

    docs = contacts_collection.find(query).sort("createdAt", -1)
    return [_contact_to_out(d) for d in docs]


def get_contact(user_id: str, contact_id: str) -> ContactOut:
    doc = contacts_collection.find_one({"_id": contact_id, "userId": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _contact_to_out(doc)


def update_contact(user_id: str, contact_id: str, payload: ContactUpdate) -> ContactOut:
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if not update_data:
        return get_contact(user_id, contact_id)

    update_data["updatedAt"] = datetime.now(timezone.utc)

    doc = contacts_collection.find_one_and_update(
        {"_id": contact_id, "userId": user_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _contact_to_out(doc)


def delete_contact(user_id: str, contact_id: str) -> None:
    result = contacts_collection.delete_one({"_id": contact_id, "userId": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


def toggle_favorite(user_id: str, contact_id: str) -> ContactOut:
    doc = contacts_collection.find_one({"_id": contact_id, "userId": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    new_value = not doc.get("isFavorite", False)
    updated = contacts_collection.find_one_and_update(
        {"_id": contact_id, "userId": user_id},
        {"$set": {"isFavorite": new_value, "updatedAt": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    return _contact_to_out(updated)

