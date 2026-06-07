from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    pass # In our flow, Google Auth provides this. No password required for SSO.

class User(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- ARTIFACT SCHEMAS ---
class ArtifactBase(BaseModel):
    artifact_type: str
    content: Dict[str, Any]

class ArtifactCreate(ArtifactBase):
    pass

class Artifact(ArtifactBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- PROJECT SCHEMAS ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "draft"

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    artifacts: List[Artifact] = []

    class Config:
        from_attributes = True

# --- AUDIT LOG SCHEMAS ---
class AuditLogBase(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
