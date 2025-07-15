import os
import requests
from flask import Blueprint, request, jsonify
from flask_cors import CORS

jobs_bp = Blueprint('jobs', __name__)
CORS(jobs_bp)  # Enable CORS if needed

ADZUNA_APP_ID = os.environ.get('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.environ.get('ADZUNA_APP_KEY')

@jobs_bp.route('/api/jobs')
def get_jobs():
    try:
        # Verify API credentials are set
        if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
            return jsonify({
                "error": "Configuration error",
                "message": "Adzuna API credentials not set"
            }), 500

        # Get parameters with defaults
        keywords = request.args.get('keywords', 'developer')
        location = request.args.get('location', 'new york')

        # Build API URL
        api_url = f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}&results_per_page=1&what={keywords}&where={location}&content-type=application/json"

        # Make request to Adzuna API
        response = requests.get(api_url)
        response.raise_for_status()  # Raises HTTPError for bad responses
        
        data = response.json()
        
        # Transform Adzuna API response to match your frontend's Job interface
        jobs = []
        for result in data.get('results', []):
            jobs.append({
                'id': str(result.get('id', '')),
                'title': result.get('title', 'No title provided'),
                'company': result.get('company', {}).get('display_name'),
                'location': result.get('location', {}).get('display_name', 'Remote'),
                'description': clean_description(result.get('description', 'No description provided')),
                'salary': format_salary(result),
                'contract_type': result.get('contract_type'),
                'created': result.get('created', ''),
                'redirect_url': result.get('redirect_url', '#'),
                # Add requirements/responsibilities if available
                'requirements': extract_requirements(result.get('description', '')),
                'responsibilities': extract_responsibilities(result.get('description', ''))
            })
            
        return jsonify(jobs)
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Job service unavailable",
            "message": str(e)
        }), 502
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

def clean_description(desc: str) -> str:
    """Basic cleaning of job descriptions"""
    if not desc:
        return "No description provided"
    # Remove any HTML tags if present
    desc = desc.replace('<br>', '\n').replace('<p>', '\n')
    # Trim long descriptions
    if len(desc) > 1500:
        desc = desc[:1500] + '...'
    return desc

def format_salary(job: dict) -> str:
    """Format salary information from Adzuna response"""
    if not job.get('salary_min') and not job.get('salary_max'):
        return None
        
    salary_min = job.get('salary_min', 0)
    salary_max = job.get('salary_max', salary_min)
    currency = job.get('salary_currency', 'GBP')  # Default to GBP as per your example
    
    if salary_min == salary_max:
        return f"{currency} {salary_min:,.0f}"
    return f"{currency} {salary_min:,.0f} - {salary_max:,.0f}"

def extract_requirements(description: str) -> list[str]:
    """Extract requirements from description (basic example)"""
    if not description:
        return []
    # This is a simple example - you might want to implement more sophisticated parsing
    lines = [line.strip() for line in description.split('\n') if line.strip()]
    requirements = [line for line in lines if line.lower().startswith(('must have', 'require', 'essential'))]
    return requirements[:5] if requirements else []

def extract_responsibilities(description: str) -> list[str]:
    """Extract responsibilities from description (basic example)"""
    if not description:
        return []
    # This is a simple example - you might want to implement more sophisticated parsing
    lines = [line.strip() for line in description.split('\n') if line.strip()]
    responsibilities = [line for line in lines if line.lower().startswith(('responsibilit', 'duties', 'will be'))]
    return responsibilities[:5] if responsibilities else []