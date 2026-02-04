import os

from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "contact_management_app")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

users_collection = db["users"]
contacts_collection = db["contacts"]


def init_indexes() -> None:
    """Create basic indexes for faster lookups and uniqueness."""
    users_collection.create_index("email", unique=True)
    contacts_collection.create_index(
        [("userId", ASCENDING), ("name", ASCENDING)],
        name="user_name_idx",
    )

