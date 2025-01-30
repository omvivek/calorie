from pydantic import BaseModel, ConfigDict
from typing import Optional

# User registration schema
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# User response schema
class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)  # Enable ORM serialization

# Search history schema

class SearchHistoryCreate(BaseModel):
    food_items: str
    response: str = None

class SearchHistoryResponse(BaseModel):
    id: int
    query: str
    response: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)  # Enable ORM serialization
