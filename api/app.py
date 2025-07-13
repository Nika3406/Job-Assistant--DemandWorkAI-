import os
import sys
import urllib.parse as urlparse
from flask import Flask, request, session, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')

if not app.secret_key:
    raise RuntimeError("SECRET_KEY environment variable not set!")

# Database configuration (using Render-style URL parsing)
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    sys.exit("Error: DATABASE_URL environment variable is not set.")

urlparse.uses_netloc.append("postgres")
DB_CONFIG = urlparse.urlparse(DATABASE_URL)

DB_CONN_PARAMS = {
    "dbname": DB_CONFIG.path,  # remove leading slash
    "user": DB_CONFIG.username,
    "password": DB_CONFIG.password,
    "host": DB_CONFIG.hostname,
    "port": DB_CONFIG.port
}

# Configure CORS
allowed_origins = [
    "https://job-assistant-demand-work-ai.vercel.app",
    "http://localhost:3000"
]

CORS(app,
     supports_credentials=True,
     resources={
         r"/api/*": {
             "origins": allowed_origins,
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type"],
             "expose_headers": ["Content-Type"]
         }
     })

def get_db():
    """Get a new database connection using Render-style config"""
    return psycopg2.connect(**DB_CONN_PARAMS)

def init_db():
    """Initialize database tables"""
    conn = get_db()
    cur = conn.cursor()
    try:
        # Users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()

# Initialize database when app starts
init_db()

@app.route('/')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "DemandWork.AI Backend",
        "version": "1.0.0"
    })

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User already exists"}), 400
            
        cur.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            (email, password)
        )
        conn.commit()
        return jsonify({"message": "User created successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT * FROM users WHERE email = %s AND password = %s",
            (email, password)
        )
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        session["user"] = user["email"]
        return jsonify({
            "message": "Login successful",
            "user": user["email"]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out"})

@app.route("/api/me", methods=["GET"])
def me():
    user = session.get("user")
    if user:
        return jsonify({"user": user})
    return jsonify({"user": None}), 401

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)