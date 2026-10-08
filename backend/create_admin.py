import os
import sys
import getpass

backend_dir = os.path.dirname(os.path.abspath(__file__))
backend_parent = os.path.dirname(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if backend_parent not in sys.path:
    sys.path.insert(0, backend_parent)

from database import SessionLocal, Base, engine
from models import User, UserRole
from security import hash_password

def create_super_admin(name=None, email=None, password=None):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("=" * 60)
        print("PARALIPAY SECURE SUPER ADMIN SETUP CLI")
        print("=" * 60)

        if not name:
            name = input("Enter Super Admin Full Name [Super Administrator]: ").strip() or "Super Administrator"
        if not email:
            email = input("Enter Super Admin Email: ").strip().lower()
        if not password:
            password = getpass.getpass("Enter Super Admin Password (min 8 chars): ").strip()

        if not email or "@" not in email:
            print("Error: A valid email address is required.")
            return False
        if len(password) < 8:
            print("Error: Password must be at least 8 characters.")
            return False

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            if existing.role == UserRole.SUPER_ADMIN:
                print(f"User with email '{email}' is already a Super Admin. Updating credentials...")
                existing.password_hash = hash_password(password)
                existing.full_name = name
                db.commit()
                print("Super Admin updated successfully.")
                return True
            else:
                print(f"User with email '{email}' exists with role '{existing.role.value}'. Elevating to SUPER_ADMIN...")
                existing.role = UserRole.SUPER_ADMIN
                existing.password_hash = hash_password(password)
                db.commit()
                print("User elevated to SUPER_ADMIN successfully.")
                return True

        admin_user = User(
            full_name=name,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.SUPER_ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"\n[SUCCESS] Super Admin '{admin_user.full_name}' ({admin_user.email}) created successfully with ID {admin_user.id}.")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) == 4:
        create_super_admin(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        create_super_admin()
