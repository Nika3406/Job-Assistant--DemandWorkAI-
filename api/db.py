import psycopg2
from psycopg2.extras import RealDictCursor
import os
import urllib.parse as urlparse

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
                resume_url TEXT
            )
        """)
        conn.commit()
    finally:
        conn.close()

def create_user(email, password):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """INSERT INTO users (email, password) 
               VALUES (%s, %s) 
               RETURNING id, email""",
            (email, password)
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

def migrate_passwords():
    """Fix double-hashed passwords (run once)"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id, password FROM users WHERE password LIKE '$2b$%$2b$%'")
        for user in cur.fetchall():
            fixed_hash = user['password'][-60:]  # Extract the inner hash
            cur.execute("UPDATE users SET password = %s WHERE id = %s", 
                       (fixed_hash, user['id']))
        conn.commit()
        return f"Migrated {cur.rowcount} passwords"
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()