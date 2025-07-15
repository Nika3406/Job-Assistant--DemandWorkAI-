from flask import Blueprint, request, jsonify, current_app
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

def get_resume_url(filename):
    """Generate URL for accessing the resume file"""
    if not filename:
        return None
    return f"/resumes/{os.path.basename(filename)}"

@profile_bp.route('/api/upload-resume', methods=['POST', 'DELETE'])
@login_required
def upload_resume():
    if request.method == 'POST':
        if 'resume' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['resume']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not (file and allowed_file(file.filename)):
            return jsonify({"error": "Invalid file type. Only PDF, DOC, and DOCX are allowed"}), 400

        try:
            # Create unique filename
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Save file
            file.save(filepath)
            
            # Generate URL for the file
            resume_url = get_resume_url(filename)
            
            # Update user record
            user_email = request.cookies.get('user_email')
            conn = get_db_connection()
            cur = conn.cursor()
            
            # First delete any existing resume
            cur.execute(
                "SELECT resume_url FROM users WHERE email = %s",
                (user_email,)
            )
            existing = cur.fetchone()
            if existing and existing[0]:
                try:
                    os.remove(os.path.join(UPLOAD_FOLDER, os.path.basename(existing[0])))
                except OSError:
                    pass
            
            # Update with new resume
            cur.execute(
                "UPDATE users SET resume_url = %s WHERE email = %s RETURNING id, email",
                (resume_url, user_email)
            )
            updated_user = cur.fetchone()
            conn.commit()
            
            return jsonify({
                "message": "Resume uploaded successfully",
                "user": {
                    "id": updated_user[0],
                    "email": updated_user[1],
                    "resume_url": resume_url
                }
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"Resume upload failed: {str(e)}")
            conn.rollback()
            return jsonify({"error": "Failed to upload resume"}), 500
        finally:
            conn.close()
    
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
                    os.remove(os.path.join(UPLOAD_FOLDER, os.path.basename(user[0])))
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