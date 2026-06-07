import os
import json
import logging
import time
from openai import OpenAI

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

def _call_json_api(prompt: str, system_prompt: str = "You are a world-class Product Manager assistant. You output valid JSON only.") -> dict:
    def _call_openai():
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return json.loads(content)
    return execute_with_backoff(_call_openai)

def generate_prd(idea: str, target_audience: str, business_goals: str) -> dict:
    prompt = f"""
    Based on the following raw product idea, target audience, and business goals, generate a comprehensive, structured Product Requirements Document (PRD).
    
    Idea: {idea}
    Target Audience: {target_audience}
    Business Goals: {business_goals}
    
    Your output MUST be a valid JSON object matching this schema:
    {{
        "title": "A short, catchy title for the product",
        "executive_summary": "1 paragraph summary",
        "user_personas": [
            {{"name": "Persona Name", "role": "Role", "pain_points": ["point 1"]}}
        ],
        "key_features": [
            {{"name": "Feature Name", "description": "What it does", "priority": "High|Medium|Low"}}
        ],
        "success_metrics": ["metric 1"]
    }}
    """
    return _call_json_api(prompt)

def generate_epics(prd_content: dict) -> dict:
    prompt = f"""
    Based on the following PRD, extract and generate a list of Epics needed to build the product.
    
    PRD JSON:
    {json.dumps(prd_content)}
    
    Your output MUST be a valid JSON object matching this schema:
    {{
        "epics": [
            {{
                "title": "Epic Title",
                "description": "Epic description",
                "goal": "What this epic achieves",
                "priority_score": 8.5
            }}
        ]
    }}
    """
    return _call_json_api(prompt)

def generate_stories(epic_content: dict) -> dict:
    prompt = f"""
    Based on the following Epic, generate a list of agile User Stories.
    
    Epic JSON:
    {json.dumps(epic_content)}
    
    Your output MUST be a valid JSON object matching this schema:
    {{
        "stories": [
            {{
                "title": "Story Title",
                "narrative": "As a [persona], I want [capability] so that [outcome]",
                "acceptance_criteria": [
                    {{"given": "...", "when": "...", "then": "..."}}
                ],
                "story_points": 3
            }}
        ]
    }}
    """
    return _call_json_api(prompt)

def generate_tasks(story_content: dict) -> dict:
    system_prompt = "You are a world-class Engineering Lead. You output valid JSON only."
    prompt = f"""
    Based on the following User Story, generate a list of concrete engineering tasks required to implement it.
    
    Story JSON:
    {json.dumps(story_content)}
    
    Your output MUST be a valid JSON object matching this schema:
    {{
        "tasks": [
            {{
                "title": "Task Title",
                "type": "frontend|backend|database|infrastructure",
                "estimated_hours": 4,
                "complexity": "low|medium|high"
            }}
        ]
    }}
    """
    return _call_json_api(prompt, system_prompt)
