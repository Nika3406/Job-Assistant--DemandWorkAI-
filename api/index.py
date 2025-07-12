import os
from flask import Flask, request, session, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

app = Flask(__name__)

# =====================
# CONFIGURATION
# =====================
app.secret_key = os.environ.get('SECRET_KEY')

if not app.secret_key:
    raise RuntimeError("SECRET_KEY environment variable not set!")

# Configure CORS for production (Vercel) and development
allowed_origins = [
    "https://job-assistant-demand-work-ai.vercel.app/",  # Replace with your Vercel URL
    "http://localhost:3000"                # For local development
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

# =====================
# DATABASE CONNECTION
# =====================
def get_db_connection():
    return psycopg2.connect(
        dbname=os.environ.get('DB_NAME', 'demandwork_db'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', 'root'),
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432')
    )

# =====================
# HEALTH CHECK ENDPOINT
# =====================
@app.route('/')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "DemandWork.AI Backend",
        "version": "1.0.0"
    })

# =====================
# AUTHENTICATION ROUTES
# =====================
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    try:
        conn = get_db_connection()
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
        conn = get_db_connection()
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

# =====================
# MAIN APPLICATION
# =====================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)