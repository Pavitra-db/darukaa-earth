from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models import Project, Site, User
from app.schemas import (
    LoginRequest,
    ProjectCreate,
    ProjectResponse,
    SiteCreate,
    SiteResponse,
    TokenResponse,
    UserCreate,
    UserResponse,
)


app = FastAPI(
    title="Darukaa.Earth API",
    description="Backend API for Darukaa.Earth",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Darukaa.Earth API is running"
    }


# -------------------------
# User Registration
# -------------------------

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -------------------------
# User Login
# -------------------------

@app.post(
    "/login",
    response_model=TokenResponse
)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -------------------------
# Projects
# -------------------------

@app.post(
    "/projects",
    response_model=ProjectResponse
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
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


@app.get(
    "/projects",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db)
):
    return db.query(Project).all()


# -------------------------
# Sites
# -------------------------

@app.post(
    "/sites",
    response_model=SiteResponse
)
def create_site(
    site_data: SiteCreate,
    db: Session = Depends(get_db)
):
    project = (
        db.query(Project)
        .filter(Project.id == site_data.project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    new_site = Site(
        name=site_data.name,
        latitude=site_data.latitude,
        longitude=site_data.longitude,
        description=site_data.description,
        project_id=site_data.project_id,
    )

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return new_site


@app.get(
    "/sites",
    response_model=list[SiteResponse]
)
def get_sites(
    db: Session = Depends(get_db)
):
    return db.query(Site).all()