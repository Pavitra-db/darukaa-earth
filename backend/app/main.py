from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, Site, User
from app.schemas import (
    ProjectCreate,
    ProjectResponse,
    SiteCreate,
    SiteResponse,
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
)


# ---------------------------------------------------
# FastAPI Application
# ---------------------------------------------------

app = FastAPI(
    title="Darukaa.Earth API",
    description="Backend API for Darukaa.Earth",
    version="1.0.0",
)


# ---------------------------------------------------
# CORS Configuration
# ---------------------------------------------------

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


# ---------------------------------------------------
# Root Endpoint
# ---------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to Darukaa.Earth API",
        "status": "running",
    }


# ---------------------------------------------------
# User Registration
# ---------------------------------------------------

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

    # Hash the password
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


# ---------------------------------------------------
# User Login
# ---------------------------------------------------

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

    # Check user and password
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


# ---------------------------------------------------
# Create Project
# ---------------------------------------------------

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


# ---------------------------------------------------
# Get All Projects
# ---------------------------------------------------

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


# ---------------------------------------------------
# Create Site
# ---------------------------------------------------

@app.post(
    "/sites",
    response_model=SiteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_site(
    site_data: SiteCreate,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == site_data.project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    new_site = Site(
        project_id=site_data.project_id,
        name=site_data.name,
        latitude=site_data.latitude,
        longitude=site_data.longitude,
        area_hectares=site_data.area_hectares,
        description=site_data.description,
    )

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return new_site


# ---------------------------------------------------
# Get All Sites
# ---------------------------------------------------

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

    return sites