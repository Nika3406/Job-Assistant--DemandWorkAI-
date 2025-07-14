import os
import openai
from typing import Dict, Any
from flask import current_app

def init_deepseek(app):
    """Initialize DeepSeek configuration with the Flask app"""
    openai.api_key = app.config.get('DEEPSEEK_API_KEY')
    openai.api_base = app.config.get('DEEPSEEK_API_BASE', 'https://api.deepseek.com/v1')

def analyze_resume_for_job(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Analyze resume against job description using DeepSeek's API
    Returns match score and feedback in structured format
    """
    try:
        response = openai.ChatCompletion.create(
            model="deepseek-chat",  # Use appropriate DeepSeek model
            messages=[
                {
                    "role": "system", 
                    "content": """You are a professional career advisor. Analyze how well this resume matches 
                                the job description and provide: 
                                1. Match percentage (0-100%) 
                                2. 3 key strengths 
                                3. 3 improvement areas 
                                4. 3 suggestions
                                Return as JSON with: score, strengths, improvements, suggestions"""
                },
                {
                    "role": "user",
                    "content": f"JOB DESCRIPTION:\n{job_description}\n\nRESUME CONTENT:\n{resume_text}"
                }
            ],
            temperature=0.7,
            response_format={ "type": "json_object" }  # Ensure JSON output
        )
        
        # Parse the JSON response
        analysis = json.loads(response.choices[0].message.content)
        
        # Validate and normalize the response
        return {
            "score": min(max(int(analysis.get("score", 0)), 100), 0),  # Ensure score is 0-100
            "strengths": analysis.get("strengths", [])[:3],
            "improvements": analysis.get("improvements", [])[:3],
            "suggestions": analysis.get("suggestions", [])[:3]
        }
        
    except Exception as e:
        current_app.logger.error(f"DeepSeek analysis failed: {str(e)}")
        return {
            "score": 0,
            "strengths": [],
            "improvements": ["AI analysis unavailable. Please try later."],
            "suggestions": []
        }