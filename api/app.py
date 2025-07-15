from flask import Flask, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import init_db
from db_routes import auth_bp
from profile import profile_bp
from ai_agents import init_deepseek
from jobs import jobs_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')

# Configuration
app.config.update(
    SESSION_COOKIE_SECURE=os.getenv('FLASK_ENV') == 'production',
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_DOMAIN=os.getenv('COOKIE_DOMAIN', None),
)

app.config['DEEPSEEK_API_KEY'] = os.environ.get('DEEPSEEK_API_KEY')
init_deepseek(app)

app.register_blueprint(jobs_bp)

if not app.secret_key:
    raise RuntimeError("SECRET_KEY environment variable not set!")

# Initialize database
init_db()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)

# CORS configuration
CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://job-assistant-demand-work-ai.vercel.app",
        "http://localhost:3000"
    ],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Type", "Set-Cookie"],
    max_age=86400
)

@app.route('/')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "DemandWork.AI Backend",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)