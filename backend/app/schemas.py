from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "planned"


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SiteBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    description: Optional[str] = None


class SiteCreate(SiteBase):
    project_id: int


class SiteResponse(SiteBase):
    id: int
    project_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"