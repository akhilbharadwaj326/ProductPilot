from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging
from ..services import ai

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Generation"]
)

logger = logging.getLogger("productpilot.api")

class IdeaInput(BaseModel):
    idea: str
    target_audience: str
    business_goals: str

@router.post("/generate/prd")
async def generate_prd_endpoint(payload: IdeaInput):
    """
    Generates a structured PRD based on user inputs.
    """
    try:
        logger.info(f"Generating PRD for idea: {payload.idea[:50]}...")
        result = ai.generate_prd(
            idea=payload.idea,
            target_audience=payload.target_audience,
            business_goals=payload.business_goals
        )
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Failed to generate PRD: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process request with AI engine.")
