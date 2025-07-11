from flask import Flask, request, session, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'super-secret-key'  # In production, use a secure env var
CORS(app, supports_credentials=True)

# --- Database connection ---
conn = psycopg2.connect(
    dbname="your_db",
    user="your_user",
    password="your_pass",
    host="localhost",  # use Docker service name if containerized
    port="5432"
)
cur = conn.cursor(cursor_factory=RealDictCursor)

# --- Create users table if not exists ---
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
)
""")
conn.commit()

# --- Routes ---
@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        return jsonify({"error": "User already exists"}), 400
    cur.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, password))
    conn.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    cur.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
    user = cur.fetchone()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    session["user"] = user["email"]
    return jsonify({"message": "Login successful", "user": user["email"]})

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
