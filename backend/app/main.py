from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import schemas

from app.database import get_db

from app.models import (
    Project,
    Site,
    User,
    EnvironmentalReading,
)

from app.schemas import (
    ProjectCreate,
    ProjectResponse,
    SiteCreate,
    SiteResponse,
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    EnvironmentalReadingCreate,
    EnvironmentalReadingResponse,
)

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.services.nasa_power import fetch_latest_weather
from app.services.biodiversity import fetch_biodiversity

from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Polygon


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="Darukaa.Earth API",
    description="Backend API for Darukaa.Earth",
    version="1.0.0",
)


# =====================================================
# CORS CONFIGURATION
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://darukaa-earth-1-mrr2.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# ROOT ENDPOINT
# =====================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to Darukaa.Earth API",
        "status": "running",
    }


# =====================================================
# USER REGISTRATION
# =====================================================

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =====================================================
# USER LOGIN
# =====================================================

@app.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    # Validate credentials
    if not user or not verify_password(
        login_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# =====================================================
# CREATE PROJECT
# =====================================================

@app.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
):
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        location=project_data.location,
        status=project_data.status,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# =====================================================
# GET ALL PROJECTS
# =====================================================

@app.get(
    "/projects",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
):
    projects = (
        db.query(Project)
        .order_by(Project.id.desc())
        .all()
    )

    return projects


# =====================================================
# HELPER:
# CONVERT DATABASE SITE TO API RESPONSE
# =====================================================

def site_to_response(site_db):
    boundary_coords = None

    if site_db.boundary:
        polygon = to_shape(site_db.boundary)

        boundary_coords = [
            {
                "lat": y,
                "lng": x,
            }
            for x, y in polygon.exterior.coords
        ]

    return {
        "id": site_db.id,
        "name": site_db.name,
        "latitude": site_db.latitude,
        "longitude": site_db.longitude,
        "area_hectares": site_db.area_hectares,
        "description": site_db.description,
        "project_id": site_db.project_id,
        "created_at": site_db.created_at,
        "boundary": boundary_coords,
    }


# =====================================================
# CREATE MONITORING SITE
# =====================================================

@app.post(
    "/sites",
    response_model=schemas.SiteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_site(
    site: schemas.SiteCreate,
    db: Session = Depends(get_db),
):
    # At least 3 points are required
    if len(site.boundary) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Boundary must contain at least 3 points.",
        )

    # Convert:
    # frontend -> (lat, lng)
    # PostGIS -> (longitude, latitude)
    polygon_points = [
        (point.lng, point.lat)
        for point in site.boundary
    ]

    # Close polygon
    if polygon_points[0] != polygon_points[-1]:
        polygon_points.append(polygon_points[0])

    try:
        polygon = Polygon(polygon_points)

        # Validate polygon
        if not polygon.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The monitoring-site boundary is invalid.",
            )

        # Create database object
        site_db = Site(
            name=site.name,
            latitude=site.latitude,
            longitude=site.longitude,
            area_hectares=site.area_hectares,
            description=site.description,
            project_id=site.project_id,
            boundary=from_shape(
                polygon,
                srid=4326,
            ),
        )

        # Save to database
        db.add(site_db)
        db.commit()
        db.refresh(site_db)

        return site_to_response(site_db)

    except HTTPException:
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to save monitoring site: {str(exc)}",
        )


# =====================================================
# GET ALL MONITORING SITES
# =====================================================

@app.get(
    "/sites",
    response_model=list[SiteResponse],
)
def get_sites(
    db: Session = Depends(get_db),
):
    sites = (
        db.query(Site)
        .order_by(Site.id.desc())
        .all()
    )

    return [
        site_to_response(site)
        for site in sites
    ]


# =====================================================
# UPDATE MONITORING SITE
# =====================================================

@app.put(
    "/sites/{site_id}",
    response_model=SiteResponse,
)
def update_site(
    site_id: int,
    site_data: schemas.SiteUpdate,
    db: Session = Depends(get_db),
):
    site = (
        db.query(Site)
        .filter(Site.id == site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoring site not found",
        )

    # Update name
    if site_data.name is not None:
        name = site_data.name.strip()

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Site name cannot be empty.",
            )

        site.name = name

    # Update description
    if site_data.description is not None:
        site.description = site_data.description

    try:
        db.commit()
        db.refresh(site)

        return site_to_response(site)

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to update monitoring site: {str(exc)}",
        )

# =====================================================
# DELETE PROJECT
# =====================================================

@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    # Find project
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    try:
        # Find monitoring sites belonging to this project
        sites = (
            db.query(Site)
            .filter(Site.project_id == project_id)
            .all()
        )

        # Delete environmental readings for those sites
        for site in sites:
            db.query(EnvironmentalReading).filter(
                EnvironmentalReading.site_id == site.id
            ).delete(
                synchronize_session=False
            )

        # Delete monitoring sites
        for site in sites:
            db.delete(site)

        # Delete project
        db.delete(project)

        db.commit()

        return {
            "message": "Project deleted successfully",
            "project_id": project_id,
        }

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to delete project: {str(exc)}",
        )
# =====================================================
# DELETE MONITORING SITE
# =====================================================

@app.delete("/sites/{site_id}")
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
):
    site = (
        db.query(Site)
        .filter(Site.id == site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoring site not found",
        )

    try:
        # Delete environmental readings first
        db.query(EnvironmentalReading).filter(
            EnvironmentalReading.site_id == site_id
        ).delete(
            synchronize_session=False
        )

        # Delete monitoring site
        db.delete(site)

        db.commit()

        return {
            "message": "Monitoring site deleted successfully",
            "site_id": site_id,
        }

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to delete monitoring site: {str(exc)}",
        )


# =====================================================
# CREATE ENVIRONMENTAL READING
# =====================================================

@app.post(
    "/readings",
    response_model=EnvironmentalReadingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_environmental_reading(
    reading_data: EnvironmentalReadingCreate,
    db: Session = Depends(get_db),
):
    # Verify site exists
    site = (
        db.query(Site)
        .filter(Site.id == reading_data.site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoring site not found",
        )

    new_reading = EnvironmentalReading(
        site_id=reading_data.site_id,
        temperature=reading_data.temperature,
        rainfall=reading_data.rainfall,
        air_quality=reading_data.air_quality,
        soil_moisture=reading_data.soil_moisture,
    )

    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)

    return new_reading


# =====================================================
# GET ENVIRONMENTAL READINGS FOR SITE
# =====================================================

@app.get(
    "/sites/{site_id}/readings",
    response_model=list[EnvironmentalReadingResponse],
)
def get_site_readings(
    site_id: int,
    db: Session = Depends(get_db),
):
    # Verify site exists
    site = (
        db.query(Site)
        .filter(Site.id == site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoring site not found",
        )

    readings = (
        db.query(EnvironmentalReading)
        .filter(
            EnvironmentalReading.site_id == site_id
        )
        .order_by(
            EnvironmentalReading.recorded_at.desc()
        )
        .all()
    )

    return readings


# =====================================================
# FETCH LATEST WEATHER FROM NASA POWER
# =====================================================

@app.post(
    "/sites/{site_id}/fetch-weather",
    response_model=EnvironmentalReadingResponse,
    status_code=status.HTTP_201_CREATED,
)
def fetch_site_weather(
    site_id: int,
    db: Session = Depends(get_db),
):
    # Find monitoring site
    site = (
        db.query(Site)
        .filter(Site.id == site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoring site not found",
        )

    try:
        # Fetch real NASA POWER data
        weather = fetch_latest_weather(
            latitude=site.latitude,
            longitude=site.longitude,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to fetch NASA POWER data: {str(exc)}",
        )

    # Save reading
    new_reading = EnvironmentalReading(
        site_id=site.id,
        temperature=weather["temperature"],
        rainfall=weather["rainfall"],
        air_quality=None,
        soil_moisture=None,
    )

    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)

    return new_reading


# =====================================================
# BIODIVERSITY DATA
# =====================================================

@app.get("/sites/{site_id}/biodiversity")
def get_site_biodiversity(
    site_id: int,
    db: Session = Depends(get_db),
):
    # Find monitoring site
    site = (
        db.query(Site)
        .filter(Site.id == site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoring site not found.",
        )

    try:
        # Fetch biodiversity information
        biodiversity = fetch_biodiversity(
            latitude=site.latitude,
            longitude=site.longitude,
            radius_km=25,
        )

        return biodiversity

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to fetch biodiversity data: {str(exc)}",
        )