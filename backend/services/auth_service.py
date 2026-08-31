import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
from os import getenv
from models.user import User
from database import SessionLocal
from sqlalchemy.exc import IntegrityError


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def register(name: str, email: str, password: str) -> dict:
    """Register a new user in the database."""
    db = SessionLocal()
    try:
        # Hash the password
        password_hash = hash_password(password)
        
        # Create new user
        user = User(
            name=name,
            email=email,
            password_hash=password_hash
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    except IntegrityError:
        db.rollback()
        raise ValueError("Email already exists")
    finally:
        db.close()


def login(email: str, password: str) -> dict:
    """Authenticate user and return JWT token."""
    db = SessionLocal()
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise ValueError("Invalid email or password")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")
        
        # Get secret key from environment
        secret_key = getenv("JWT_SECRET_KEY")
        if not secret_key:
            raise ValueError("JWT_SECRET_KEY not configured")
        
        # Create JWT token
        payload = {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        access_token = jwt.encode(payload, secret_key, algorithm="HS256")
        
        return {
            "token_type": "Bearer",
            "access_token": access_token
        }
    finally:
        db.close()


def verify_token(token: str) -> User:
    """Verify JWT token and return User from database."""
    secret_key = getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise ValueError("JWT_SECRET_KEY not configured")
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        if not user_id:
            raise ValueError("Invalid token payload")
        
        # Get user from database
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if not user:
                raise ValueError("User not found")
            return user
        finally:
            db.close()
    except JWTError:
        raise ValueError("Invalid or expired token")
