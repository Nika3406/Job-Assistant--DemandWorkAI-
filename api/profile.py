from flask import Blueprint, request, jsonify
from db import get_db_connection
import os
from werkzeug.utils import secure_filename
import uuid
from functools import wraps
import bcrypt

profile_bp = Blueprint('profile', __name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads/resumes'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in request.cookies:
            return jsonify({"error": "Login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/api/upload-resume', methods=['POST', 'DELETE'])
@login_required
def upload_resume():
    if request.method == 'POST':
        if 'resume' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['resume']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if file and allowed_file(file.filename):
            # Create unique filename
            filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Update user record with resume URL
            user_email = request.cookies.get('user_email')
            conn = get_db_connection()
            cur = conn.cursor()
            try:
                cur.execute(
                    "UPDATE users SET resume_url = %s WHERE email = %s RETURNING id, email, resume_url",
                    (filepath, user_email)
                )
                updated_user = cur.fetchone()
                conn.commit()
                return jsonify({
                    "message": "Resume uploaded successfully",
                    "user": {
                        "id": updated_user[0],
                        "email": updated_user[1],
                        "resume_url": updated_user[2]
                    }
                }), 200
            except Exception as e:
                conn.rollback()
                return jsonify({"error": str(e)}), 500
            finally:
                conn.close()
                
        return jsonify({"error": "Invalid file type"}), 400
    
    elif request.method == 'DELETE':
        user_email = request.cookies.get('user_email')
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            # Get current resume path
            cur.execute(
                "SELECT resume_url FROM users WHERE email = %s",
                (user_email,)
            )
            user = cur.fetchone()
            
            if user and user[0]:
                # Delete the file
                try:
                    os.remove(user[0])
                except OSError:
                    pass
                
                # Clear the resume URL
                cur.execute(
                    "UPDATE users SET resume_url = NULL WHERE email = %s RETURNING id, email",
                    (user_email,)
                )
                updated_user = cur.fetchone()
                conn.commit()
                return jsonify({
                    "message": "Resume deleted successfully",
                    "user": {
                        "id": updated_user[0],
                        "email": updated_user[1]
                    }
                }), 200
            else:
                return jsonify({"error": "No resume found"}), 404
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

@profile_bp.route('/api/profile', methods=['GET', 'PUT'])
@login_required
def manage_profile():
    user_email = request.cookies.get('user_email')
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if request.method == 'GET':
            cur.execute(
                "SELECT id, email, first_name, last_name, resume_url FROM users WHERE email = %s",
                (user_email,)
            )
            user = cur.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            return jsonify({
                "user": {
                    "id": user[0],
                    "email": user[1],
                    "first_name": user[2],
                    "last_name": user[3],
                    "resume_url": user[4]
                }
            })
            
        elif request.method == 'PUT':
            data = request.get_json()
            # Handle password update
            if 'current_password' in data and 'new_password' in data:
                # Verify current password
                cur.execute(
                    "SELECT password FROM users WHERE email = %s",
                    (user_email,)
                )
                user = cur.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                

                if not bcrypt.checkpw(
                    data['current_password'].encode('utf-8'),
                    user[0].encode('utf-8')
                ):
                    return jsonify({"error": "Current password is incorrect"}), 401
                
                # Hash new password
                hashed = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
                hashed_password = hashed.decode('utf-8')
                
                # Update password
                cur.execute(
                    "UPDATE users SET password = %s WHERE email = %s RETURNING id, email",
                    (hashed_password, user_email)
                )
                updated_user = cur.fetchone()
                conn.commit()
                
                return jsonify({
                    "message": "Password updated successfully",
                    "user": {
                        "id": updated_user[0],
                        "email": updated_user[1]
                    }
                })
            
            # Handle profile update
            cur.execute(
                """UPDATE users 
                SET first_name = %s, last_name = %s 
                WHERE email = %s 
                RETURNING id, email, first_name, last_name""",
                (data.get('first_name'), data.get('last_name'), user_email)
            )
            updated_user = cur.fetchone()
            conn.commit()
            
            return jsonify({
                "message": "Profile updated successfully",
                "user": {
                    "id": updated_user[0],
                    "email": updated_user[1],
                    "first_name": updated_user[2],
                    "last_name": updated_user[3]
                }
            })
            
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()