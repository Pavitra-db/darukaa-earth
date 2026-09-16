from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str
    location: str


class SiteCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    area_hectares: float