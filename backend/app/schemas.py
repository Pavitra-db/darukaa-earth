from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# =====================================================
# PROJECT SCHEMAS
# =====================================================

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

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# SITE SCHEMAS
# =====================================================

class Coordinate(BaseModel):
    lat: float
    lng: float


class SiteBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    area_hectares: float
    description: Optional[str] = None


class SiteCreate(SiteBase):
    project_id: int
    boundary: List[Coordinate]

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class SiteResponse(SiteBase):
    id: int
    project_id: int
    created_at: datetime
    boundary: Optional[List[Coordinate]] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# USER SCHEMAS
# =====================================================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# LOGIN
# =====================================================

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    email: str


# =====================================================
# ENVIRONMENTAL READING SCHEMAS
# =====================================================

class EnvironmentalReadingCreate(BaseModel):
    site_id: int

    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    air_quality: Optional[float] = None
    soil_moisture: Optional[float] = None


class EnvironmentalReadingResponse(BaseModel):
    id: int
    site_id: int

    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    air_quality: Optional[float] = None
    soil_moisture: Optional[float] = None

    recorded_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )