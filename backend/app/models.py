from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from geoalchemy2 import Geometry

from app.database import Base


# =====================================================
# PROJECT
# =====================================================

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(100), nullable=False)

    description = Column(Text, nullable=True)

    location = Column(String(150), nullable=False)

    status = Column(
        String(50),
        default="planned",
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )


# =====================================================
# MONITORING SITE
# =====================================================

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    name = Column(String(100), nullable=False)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    area_hectares = Column(Float, nullable=False)

    description = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    boundary = Column(
        Geometry(
            "POLYGON",
            srid=4326,
        ),
        nullable=True,
    )


# =====================================================
# USER
# =====================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password = Column(
        String(255),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )


# =====================================================
# ENVIRONMENTAL READING
# =====================================================

class EnvironmentalReading(Base):
    __tablename__ = "environmental_readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    site_id = Column(
        Integer,
        ForeignKey("sites.id"),
        nullable=False,
    )

    temperature = Column(
        Float,
        nullable=True,
    )

    rainfall = Column(
        Float,
        nullable=True,
    )

    air_quality = Column(
        Float,
        nullable=True,
    )

    soil_moisture = Column(
        Float,
        nullable=True,
    )

    recorded_at = Column(
        DateTime,
        server_default=func.now(),
    )
