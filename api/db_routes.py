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
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400
        
    if not is_valid_password(password):
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    
    try:
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "User already exists"}), 400
            
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = create_user(email, hashed_password)
        
        session['user_id'] = new_user['id']
        session['user_email'] = new_user['email']
        
        return jsonify({
            "message": "User created successfully",
            "user": {
                "id": new_user['id'],
                "email": new_user['email']
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
            
        session['user_id'] = user['id']
        session['user_email'] = user['email']
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "email": user['email']
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

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
            "email": user['email'],
            "first_name": user.get('first_name'),
            "last_name": user.get('last_name')
        }
    })