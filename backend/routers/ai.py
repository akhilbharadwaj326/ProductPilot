from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging
from typing import Dict, Any

from ..services import ai
from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Generation"]
)

logger = logging.getLogger("productpilot.api")

class IdeaInput(BaseModel):
    project_id: int
    idea: str
    target_audience: str
    business_goals: str

class GenerateInput(BaseModel):
    artifact_id: int

@router.post("/generate/prd")
async def generate_prd_endpoint(payload: IdeaInput, db: Session = Depends(get_db)):
    try:
        logger.info(f"Generating PRD for project {payload.project_id}")
        result = ai.generate_prd(
            idea=payload.idea,
            target_audience=payload.target_audience,
            business_goals=payload.business_goals
        )
        
        # Save to DB
        artifact = models.Artifact(
            project_id=payload.project_id,
            artifact_type="PRD",
            content=result
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)
        
        return {"status": "success", "artifact_id": artifact.id, "data": result}
    except Exception as e:
        logger.error(f"Failed to generate PRD: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/epics")
async def generate_epics_endpoint(payload: GenerateInput, db: Session = Depends(get_db)):
    try:
        # Fetch parent PRD
        prd = db.query(models.Artifact).filter(models.Artifact.id == payload.artifact_id, models.Artifact.artifact_type == "PRD").first()
        if not prd:
            raise HTTPException(status_code=404, detail="PRD artifact not found")
            
        logger.info(f"Generating Epics for PRD {prd.id}")
        result = ai.generate_epics(prd.content)
        
        # Save to DB
        artifact = models.Artifact(
            project_id=prd.project_id,
            artifact_type="EPIC_COLLECTION",
            content=result
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)
        
        return {"status": "success", "artifact_id": artifact.id, "data": result}
    except Exception as e:
        logger.error(f"Failed to generate Epics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/stories")
async def generate_stories_endpoint(payload: GenerateInput, db: Session = Depends(get_db)):
    try:
        epic = db.query(models.Artifact).filter(models.Artifact.id == payload.artifact_id).first()
        if not epic:
            raise HTTPException(status_code=404, detail="Epic artifact not found")
            
        logger.info(f"Generating Stories for Epic {epic.id}")
        result = ai.generate_stories(epic.content)
        
        # Save to DB
        artifact = models.Artifact(
            project_id=epic.project_id,
            artifact_type="STORY_COLLECTION",
            content=result
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)
        
        return {"status": "success", "artifact_id": artifact.id, "data": result}
    except Exception as e:
        logger.error(f"Failed to generate Stories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/tasks")
async def generate_tasks_endpoint(payload: GenerateInput, db: Session = Depends(get_db)):
    try:
        story = db.query(models.Artifact).filter(models.Artifact.id == payload.artifact_id).first()
        if not story:
            raise HTTPException(status_code=404, detail="Story artifact not found")
            
        logger.info(f"Generating Tasks for Story {story.id}")
        result = ai.generate_tasks(story.content)
        
        # Save to DB
        artifact = models.Artifact(
            project_id=story.project_id,
            artifact_type="TASK_COLLECTION",
            content=result
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)
        
        return {"status": "success", "artifact_id": artifact.id, "data": result}
    except Exception as e:
        logger.error(f"Failed to generate Tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
