from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, Site
from app.schemas import (
    ProjectCreate,
    ProjectResponse,
    SiteCreate,
    SiteResponse,
)


# --------------------------------------------------
# Create FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Darukaa.Earth API",
    description="Backend API for the Darukaa.Earth platform",
    version="1.0.0",
)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Basic Routes
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Darukaa.Earth backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# Project APIs
# --------------------------------------------------

@app.post("/projects")
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
):
    new_project = Project(
        name=project.name,
        description=project.description,
        location=project.location,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project created successfully",
        "project": {
            "id": new_project.id,
            "name": new_project.name,
            "description": new_project.description,
            "location": new_project.location,
        },
    }


@app.get("/projects")
def get_projects(
    db: Session = Depends(get_db),
):
    projects = db.query(Project).all()

    return {
        "projects": [
            {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "location": project.location,
            }
            for project in projects
        ]
    }


@app.get("/projects/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "location": project.location,
    }


# --------------------------------------------------
# Site APIs
# --------------------------------------------------

@app.post("/projects/{project_id}/sites")
def create_site(
    project_id: int,
    site: SiteCreate,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    if not -90 <= site.latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90",
        )

    if not -180 <= site.longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Longitude must be between -180 and 180",
        )

    if site.area_hectares <= 0:
        raise HTTPException(
            status_code=400,
            detail="Area must be greater than zero",
        )

    new_site = Site(
        project_id=project_id,
        name=site.name,
        latitude=site.latitude,
        longitude=site.longitude,
        area_hectares=site.area_hectares,
    )

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return {
        "message": "Site created successfully",
        "site": {
            "id": new_site.id,
            "project_id": new_site.project_id,
            "name": new_site.name,
            "latitude": new_site.latitude,
            "longitude": new_site.longitude,
            "area_hectares": new_site.area_hectares,
        },
    }


@app.get("/projects/{project_id}/sites")
def get_project_sites(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    project_sites = (
        db.query(Site)
        .filter(Site.project_id == project_id)
        .all()
    )

    return {
        "project_id": project_id,
        "sites": [
            {
                "id": site.id,
                "project_id": site.project_id,
                "name": site.name,
                "latitude": site.latitude,
                "longitude": site.longitude,
                "area_hectares": site.area_hectares,
            }
            for site in project_sites
        ],
    }


@app.get("/sites/{site_id}")
def get_site(
    site_id: int,
    db: Session = Depends(get_db),
):
    site = (
        db.query(Site)
        .filter(Site.id == site_id)
        .first()
    )

    if site is None:
        raise HTTPException(
            status_code=404,
            detail="Site not found",
        )

    return {
        "id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "latitude": site.latitude,
        "longitude": site.longitude,
        "area_hectares": site.area_hectares,
    }