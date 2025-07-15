import os
import requests
from flask import Blueprint, request, jsonify
from flask_cors import CORS  # Add this import

jobs_bp = Blueprint('jobs', __name__)
CORS(jobs_bp)  # Enable CORS if needed

ADZUNA_APP_ID = os.environ.get('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.environ.get('ADZUNA_APP_KEY')

@jobs_bp.route('/api/jobs')
def get_jobs():
    try:
        if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
            return jsonify({"error": "API credentials missing"}), 500

        # Get parameters with defaults
        keywords = request.args.get('keywords', 'developer')
        location = request.args.get('location', 'new york')
        country = request.args.get('country', 'us')

        # Build API URL
        api_url = (
            f"https://api.adzuna.com/v1/api/jobs/{country}/search/1?"
            f"app_id={ADZUNA_APP_ID}&"
            f"app_key={ADZUNA_APP_KEY}&"
            f"results_per_page=20&"
            f"what={keywords}&"
            f"where={location}"
        )

        response = requests.get(api_url)
        response.raise_for_status()
        
        data = response.json()
        jobs = []
        
        for result in data.get('results', []):
            jobs.append({
                'id': str(result.get('id', '')),
                'title': result.get('title', 'No title'),
                'company': result.get('company', {}).get('display_name'),
                'location': result.get('location', {}).get('display_name', 'Remote'),
                'description': clean_description(result.get('description', '')),
                'salary': format_salary(result),
                'contract_type': result.get('contract_type'),
                'created': result.get('created', ''),
                'redirect_url': result.get('redirect_url', '#')
            })
            
        return jsonify(jobs)
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Job service error: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

def clean_description(desc: str) -> str:
    """Basic HTML cleaning for descriptions"""
    if not desc:
        return "No description provided"
    # Add more cleaning as needed
    return desc.replace('<br>', '\n').replace('<p>', '\n')

def format_salary(job):
    if not job.get('salary_min') and not job.get('salary_max'):
        return None
        
    salary_min = job.get('salary_min', 0)
    salary_max = job.get('salary_max', salary_min)
    currency = job.get('salary_currency', 'USD')
    
    if salary_min == salary_max:
        return f"{currency} {salary_min:,}"
    return f"{currency} {salary_min:,} - {salary_max:,}"