import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Find absolute path for backend directory so SQLite DB is unified regardless of CWD
backend_dir = os.path.dirname(os.path.abspath(__file__))
default_sqlite_path = os.path.join(backend_dir, "paralipay_v3.db").replace("\\", "/")
default_url = f"sqlite:///{default_sqlite_path}"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or DATABASE_URL.startswith("sqlite:///./"):
    DATABASE_URL = default_url

# PostgreSQL fix: if postgres:// URL is provided, normalize to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30.0}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
