import os
import requests
from flask import Blueprint, request, jsonify
from functools import lru_cache

jobs_bp = Blueprint('jobs', __name__)

ADZUNA_APP_ID = os.environ.get('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.environ.get('ADZUNA_APP_KEY')

@jobs_bp.route('/api/jobs')
@lru_cache(maxsize=128, typed=False)
def get_jobs():
    try:
        keywords = request.args.get('keywords', 'developer')
        location = request.args.get('location', 'new york')
        country = 'us'
        
        if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
            return jsonify({"error": "Adzuna API credentials not configured"}), 500
            
        print(f"Making request to Adzuna with: keywords={keywords}, location={location}")  # Debug log
        
        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
        params = {
            'app_id': ADZUNA_APP_ID,
            'app_key': ADZUNA_APP_KEY,
            'results_per_page': 20,
            'what': keywords,
            'where': location,
            'content-type': 'application/json'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()  # Will raise for 4XX/5XX status codes
        
        data = response.json()
        print(f"Received {len(data.get('results', []))} jobs from Adzuna")  # Debug log
        
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
        
    except requests.exceptions.RequestException as e:
        print(f"Adzuna API request failed: {str(e)}")  # Debug log
        return jsonify({'error': f"Job search service unavailable: {str(e)}"}), 500
    except Exception as e:
        print(f"Unexpected error in job search: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

def format_salary(job):
    if not job.get('salary_min') and not job.get('salary_max'):
        return None
        
    salary_min = job.get('salary_min', 0)
    salary_max = job.get('salary_max', salary_min)
    currency = job.get('salary_currency', 'USD')
    
    if salary_min == salary_max:
        return f"{currency} {salary_min:,}"
    return f"{currency} {salary_min:,} - {salary_max:,}"