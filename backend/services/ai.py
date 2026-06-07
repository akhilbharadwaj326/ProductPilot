import os
import json
import logging
import time
from openai import OpenAI
from pydantic import BaseModel

# Initialize logger
logger = logging.getLogger("productpilot.ai")
logger.setLevel(logging.INFO)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def execute_with_backoff(func, max_retries=3, base_delay=2):
    """Executes a function with exponential backoff to handle rate limits."""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Final attempt failed: {str(e)}")
                raise e
            delay = base_delay * (2 ** attempt)
            logger.warning(f"OpenAI API call failed. Retrying in {delay} seconds. Error: {str(e)}")
            time.sleep(delay)

def generate_prd(idea: str, target_audience: str, business_goals: str) -> dict:
    """Generates a structured PRD based on raw inputs."""
    
    prompt = f"""
    You are an expert Product Manager. Based on the following raw product idea, target audience, and business goals, generate a comprehensive, structured Product Requirements Document (PRD).
    
    Idea: {idea}
    Target Audience: {target_audience}
    Business Goals: {business_goals}
    
    Your output MUST be a valid JSON object matching this schema:
    {{
        "title": "A short, catchy title for the product",
        "executive_summary": "1 paragraph summary",
        "user_personas": [
            {{"name": "Persona Name", "role": "Role", "pain_points": ["point 1", "point 2"]}}
        ],
        "key_features": [
            {{"name": "Feature Name", "description": "What it does", "priority": "High|Medium|Low"}}
        ],
        "success_metrics": ["metric 1", "metric 2"]
    }}
    
    Output ONLY valid JSON. No markdown formatting, no explanations.
    """
    
    def _call_openai():
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106", # Using 1106 for better JSON following
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a world-class Product Manager assistant. You output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return json.loads(content)

    return execute_with_backoff(_call_openai)
