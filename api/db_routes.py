from flask import Blueprint, request, session, jsonify
from db import create_user, get_user_by_email
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        # Check if user already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "User already exists"}), 400
            
        # Hash password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create new user
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
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Set up session
        session['user_id'] = user['id']
        session['user_email'] = user['email']
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "email": user['email'],
                "id": user['id']
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('user_email', None)
    return jsonify({"message": "Logged out successfully"})

@auth_bp.route('/api/me', methods=['GET'])
def get_current_user():
    user_email = session.get('user_email')
    if not user_email:
        return jsonify({"user": None}), 401
        
    user = get_user_by_email(user_email)
    if not user:
        return jsonify({"user": None}), 401
        
    return jsonify({
        "user": {
            "email": user['email'],
            "id": user['id'],
            "first_name": user.get('first_name'),
            "last_name": user.get('last_name')
        }
    })