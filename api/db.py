import psycopg2
from psycopg2.extras import RealDictCursor
import os
import urllib.parse as urlparse
import bcrypt

# Database configuration
def get_db_config():
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL environment variable is not set.")
    
    urlparse.uses_netloc.append("postgres")
    DB_CONFIG = urlparse.urlparse(DATABASE_URL)
    
    return {
        "dbname": DB_CONFIG.path[1:],
        "user": DB_CONFIG.username,
        "password": DB_CONFIG.password,
        "host": DB_CONFIG.hostname,
        "port": DB_CONFIG.port
    }

def get_db_connection():
    return psycopg2.connect(**get_db_config())

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                resume_url TEXT
            )
        """)
        conn.commit()
    finally:
        conn.close()

def create_user(email, password, first_name=None, last_name=None):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Hash the password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cur.execute(
            """INSERT INTO users (email, password, first_name, last_name) 
               VALUES (%s, %s, %s, %s) 
               RETURNING id, email, first_name, last_name""",
            (email, hashed_password, first_name, last_name)
        )
        user = cur.fetchone()
        conn.commit()
        return user
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        return cur.fetchone()
    finally:
        conn.close()