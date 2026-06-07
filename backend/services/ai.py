import os
import json
import logging
import time
from openai import OpenAI

# Initialize logger
logger = logging.getLogger("productpilot.ai")
logger.setLevel(logging.INFO)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load the master system prompt dynamically
PROMPT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "docs", "product_pilot_system_prompt.md")
try:
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        MASTER_SYSTEM_PROMPT = f.read()
except Exception as e:
    logger.error(f"Failed to load master system prompt: {e}")
    MASTER_SYSTEM_PROMPT = "You are Product Pilot, an enterprise-grade AI Product Intelligence System. Output valid JSON only."

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

def _call_json_api(user_prompt: str) -> dict:
    def _call_openai():
        response = client.chat.completions.create(
            # Using gpt-4-turbo-preview because the system prompt is ~19,000 tokens. 
            # This requires a 128k context window to process safely without truncation.
            model="gpt-4-turbo-preview", 
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": MASTER_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return json.loads(content)
    return execute_with_backoff(_call_openai)

def generate_prd(idea: str, target_audience: str, business_goals: str) -> dict:
    prompt = f"""
    EXECUTE STEP 1 (PROBLEM), STEP 2 (USERS), STEP 3 (OUTCOMES), AND STEP 4 (REQUIREMENTS).
    
    Raw Idea: {idea}
    Target Audience: {target_audience}
    Business Goals: {business_goals}
    
    Your output MUST be a valid JSON object matching Schema 1 (Persona) and Schema 2 (PRD) combined under a root object.
    Example:
    {{
      "personas": [ {{ ...schema 1... }} ],
      "prd": {{ ...schema 2... }}
    }}
    
    Output ONLY valid JSON.
    """
    return _call_json_api(prompt)

def generate_epics(prd_content: dict) -> dict:
    prompt = f"""
    EXECUTE STEP 5 (FEATURES) AND STEP 6 (EPICS).
    
    Based on the following approved PRD and Personas:
    {json.dumps(prd_content)}
    
    Your output MUST be a valid JSON object containing an array of Features (Schema 3) and an array of Epics (Schema 4).
    Example:
    {{
      "features": [ {{ ...schema 3... }} ],
      "epics": [ {{ ...schema 4... }} ]
    }}
    
    Output ONLY valid JSON.
    """
    return _call_json_api(prompt)

def generate_stories(epic_content: dict) -> dict:
    prompt = f"""
    EXECUTE STEP 7 (STORIES).
    
    Based on the following approved Epics and Features:
    {json.dumps(epic_content)}
    
    Your output MUST be a valid JSON object containing an array of User Stories (Schema 5) corresponding to the Epics.
    Example:
    {{
      "stories": [ {{ ...schema 5... }} ]
    }}
    
    Output ONLY valid JSON. Ensure strict traceability (epic_ids must match).
    """
    return _call_json_api(prompt)

def generate_tasks(story_content: dict) -> dict:
    prompt = f"""
    EXECUTE STEP 8 (TASKS) AND STEP 9 (DEPENDENCIES).
    
    Based on the following approved User Stories:
    {json.dumps(story_content)}
    
    Your output MUST be a valid JSON object containing an array of Engineering Tasks (Schema 6) corresponding to the Stories.
    Example:
    {{
      "tasks": [ {{ ...schema 6... }} ]
    }}
    
    Output ONLY valid JSON. Ensure strict traceability (story_ids must match).
    """
    return _call_json_api(prompt)
