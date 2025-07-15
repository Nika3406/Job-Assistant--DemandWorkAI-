from flask import Blueprint, request, session, jsonify
from db import create_user, get_user_by_email
import bcrypt
import re

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_password(password):
    return len(password) >= 8

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "User already exists"}), 400
            
        # PROPER HASHING (only place it happens)
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        hashed_password = hashed.decode('utf-8')  # Store as string
        
        new_user = create_user(email, hashed_password)
        return jsonify({
            "message": "User created successfully",
            "user": {
                "email": new_user['email'],
                "id": new_user['id']
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Set session cookie
        response = jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "email": user['email']
            }
        })
        response.set_cookie('user_email', user['email'], secure=True, httponly=True)
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    try:
        # Create response
        response = jsonify({
            "message": "Logout successful",
            "user": None
        })
        
        # Clear the authentication cookies
        response.set_cookie('user_email', '', expires=0, secure=True, httponly=True, samesite='Lax')
        response.set_cookie('session', '', expires=0, secure=True, httponly=True, samesite='Lax')
        
        # If you're using server-side sessions
        session.clear()
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"user": None}), 401
        
    user = get_user_by_email(session.get('user_email'))
    if not user:
        return jsonify({"user": None}), 401
        
    return jsonify({
        "user": {
            "id": user['id'],
            "email": user['email']
        }
    })