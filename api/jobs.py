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
        country = 'us'  # or 'gb' for UK

        # Print debug info (check your server logs)
        print(f"Making request to Adzuna with: {ADZUNA_APP_ID[:3]}...{ADZUNA_APP_ID[-3:]}")
        
        response = requests.get(
            f"http://api.adzuna.com/v1/api/jobs/{country}/search/1",
            params={
                'app_id': ADZUNA_APP_ID,
                'app_key': ADZUNA_APP_KEY,
                'results_per_page': 20,
                'what': keywords,
                'where': location,
                'content-type': 'application/json'
            }
        )
        
        # Print response status for debugging
        print(f"Adzuna API response status: {response.status_code}")
        
        response.raise_for_status()  # Will raise for 4XX/5XX errors
        
        data = response.json()
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
        print(f"Adzuna API HTTP Error: {str(e)}")
        return jsonify({"error": f"Job service error: {str(e)}"}), 502
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Failed to fetch jobs"}), 500

def format_salary(job):
    if not job.get('salary_min') and not job.get('salary_max'):
        return None
        
    salary_min = job.get('salary_min', 0)
    salary_max = job.get('salary_max', salary_min)
    currency = job.get('salary_currency', 'USD')
    
    if salary_min == salary_max:
        return f"{currency} {salary_min:,}"
    return f"{currency} {salary_min:,} - {salary_max:,}"