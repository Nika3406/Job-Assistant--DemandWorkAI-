import os
import requests
from flask import Blueprint, request, jsonify

jobs_bp = Blueprint('jobs', __name__)

ADZUNA_APP_ID = os.environ.get('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.environ.get('ADZUNA_APP_KEY')

@jobs_bp.route('/api/jobs')
def get_jobs():
    try:
        # Verify API credentials are set
        if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
            return jsonify({"error": "Adzuna API credentials not configured"}), 500

        keywords = request.args.get('keywords', 'developer')
        location = request.args.get('location', 'new york')
        country = 'us'  # default to US, but could be parameterized

        # Build the exact API URL as per Adzuna documentation
        api_url = (
            f"http://api.adzuna.com/v1/api/jobs/{country}/search/1?"
            f"app_id={ADZUNA_APP_ID}&"
            f"app_key={ADZUNA_APP_KEY}&"
            f"results_per_page=20&"
            f"what={keywords}&"
            f"where={location}&"
            f"content-type=application/json"
        )

        print(f"Making Adzuna API request to: {api_url.split('?')[0]}?...")  # Don't log full URL with keys
        
        response = requests.get(api_url)
        response.raise_for_status()  # Raises exception for 4XX/5XX errors
        
        data = response.json()
        
        # Process results as before
        jobs = []
        for result in data.get('results', []):
            jobs.append({
                'id': result.get('id'),
                'title': result.get('title'),
                'company': result.get('company', {}).get('display_name'),
                'location': result.get('location', {}).get('display_name'),
                'description': result.get('description'),
                'salary': format_salary(result),
                'contract_type': result.get('contract_type'),
                'created': result.get('created'),
                'redirect_url': result.get('redirect_url')
            })
            
        return jsonify(jobs)
        
    except requests.exceptions.HTTPError as e:
        error_msg = f"Adzuna API Error: {str(e)}"
        if e.response:
            error_msg += f" | Response: {e.response.text[:200]}"
        print(error_msg)
        return jsonify({"error": "Failed to fetch jobs from job service"}), 502
    except Exception as e:
        print(f"Unexpected error in jobs endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def format_salary(job):
    if not job.get('salary_min') and not job.get('salary_max'):
        return None
        
    salary_min = job.get('salary_min', 0)
    salary_max = job.get('salary_max', salary_min)
    currency = job.get('salary_currency', 'USD')
    
    if salary_min == salary_max:
        return f"{currency} {salary_min:,}"
    return f"{currency} {salary_min:,} - {salary_max:,}"