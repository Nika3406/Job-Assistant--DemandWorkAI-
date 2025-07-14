import os
import requests
from flask import Blueprint, request, jsonify
from functools import lru_cache

jobs_bp = Blueprint('jobs', __name__)

ADZUNA_APP_ID = os.environ.get('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.environ.get('ADZUNA_APP_KEY')

@jobs_bp.route('/api/jobs')
@lru_cache(maxsize=128, typed=False)  # Cache results for better performance
def get_jobs():
    keywords = request.args.get('keywords', 'developer')
    location = request.args.get('location', 'new york')
    country = 'us'  # Change based on your target country
    
    try:
        url = f"http://api.adzuna.com/v1/api/jobs/{country}/search/1"
        params = {
            'app_id': ADZUNA_APP_ID,
            'app_key': ADZUNA_APP_KEY,
            'results_per_page': 20,
            'what': keywords,
            'where': location,
            'content-type': 'application/json'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        jobs = []
        for result in response.json().get('results', []):
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
        
    except Exception as e:
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