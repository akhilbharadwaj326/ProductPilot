import logging

logger = logging.getLogger("productpilot.scoring")

def calculate_risk_score(probability: int, impact: int) -> float:
    """
    Calculates a normalized risk score (0-10).
    Probability and Impact are assumed to be on a 1-5 scale.
    Formula: (Probability * Impact) / 25 * 10
    """
    try:
        # Clamp inputs between 1 and 5
        p = max(1, min(5, probability))
        i = max(1, min(5, impact))
        
        raw_score = p * i
        normalized = (raw_score / 25.0) * 10.0
        return round(normalized, 1)
    except Exception as e:
        logger.error(f"Error calculating risk score: {e}")
        return 0.0

def calculate_priority_score(
    business_value: float,
    user_impact: float,
    complexity: str = "medium",
    dependency_count: int = 0
) -> float:
    """
    Calculates a deterministic priority score (0-10) based on heuristics.
    - business_value: 0-10 scale
    - user_impact: 0-10 scale
    - complexity: 'low', 'medium', 'high', 'xl'
    - dependency_count: integer representing blocking dependencies
    """
    try:
        effort_map = {"low": 2.0, "medium": 5.0, "high": 8.0, "xl": 10.0}
        effort = effort_map.get(complexity.lower(), 5.0)
        
        # Clamp inputs
        bv = max(0.0, min(10.0, business_value))
        ui = max(0.0, min(10.0, user_impact))
        
        # Base formula: 40% Business Value, 40% User Impact, 20% Technical Ease (10 - effort)
        base_score = (bv * 0.4) + (ui * 0.4) + ((10.0 - effort) * 0.2)
        
        # Apply a dependency penalty (-0.5 per dependency, max penalty of -2.0)
        dep_penalty = min(dependency_count * 0.5, 2.0)
        
        final_score = base_score - dep_penalty
        
        # Clamp final result between 0 and 10
        return max(0.0, min(10.0, round(final_score, 1)))
    except Exception as e:
        logger.error(f"Error calculating priority score: {e}")
        return 0.0

def get_priority_tier(score: float) -> str:
    """Returns the priority tier (P0-P3) based on the priority score."""
    if score >= 8.5: return "P0"
    if score >= 7.0: return "P1"
    if score >= 5.0: return "P2"
    return "P3"
