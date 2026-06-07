from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import scoring

router = APIRouter(
    prefix="/api/scoring",
    tags=["Smart Logic Engine"]
)

class RiskInput(BaseModel):
    probability: int
    impact: int

class PriorityInput(BaseModel):
    business_value: float
    user_impact: float
    complexity: str = "medium"
    dependency_count: int = 0

@router.post("/risk")
def score_risk(payload: RiskInput):
    if not (1 <= payload.probability <= 5) or not (1 <= payload.impact <= 5):
        raise HTTPException(status_code=400, detail="Probability and Impact must be between 1 and 5")
        
    score = scoring.calculate_risk_score(payload.probability, payload.impact)
    
    # Determine severity
    severity = "low"
    if score >= 7.0: severity = "critical"
    elif score >= 5.0: severity = "high"
    elif score >= 3.0: severity = "medium"
    
    return {
        "status": "success",
        "score": score,
        "severity": severity
    }

@router.post("/priority")
def score_priority(payload: PriorityInput):
    score = scoring.calculate_priority_score(
        business_value=payload.business_value,
        user_impact=payload.user_impact,
        complexity=payload.complexity,
        dependency_count=payload.dependency_count
    )
    
    tier = scoring.get_priority_tier(score)
    
    return {
        "status": "success",
        "score": score,
        "tier": tier
    }
