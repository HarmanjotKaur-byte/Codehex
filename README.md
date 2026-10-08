# ParaliPay — AI-Enabled Biomass Marketplace & Stubble Valorization Platform

ParaliPay is a full-stack platform addressing paddy stubble burning in Northwest India by providing accurate stubble estimation (ML Regression), high-resolution spatio-temporal burning risk forecasting (ML Classification), transparent multi-criteria buyer matching, role-based access control, government officer verification workflows, and an active biomass marketplace.

---

## System Requirements & Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL (or development SQLite fallback)

---

## 1. Environment Configuration
Create a `.env` file at the root of the project (refer to `.env.example`):
```env
# Database URL (PostgreSQL or SQLite)
DATABASE_URL=sqlite:///./paralipay.db
# For PostgreSQL: postgresql://postgres:password@localhost:5432/paralipay_db

# Security
JWT_SECRET_KEY=paralipay_super_secure_jwt_secret_key_change_in_production_2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Verification file uploads
UPLOAD_DIR=./uploads/verification_docs
```

---

## 2. Database Migrations
Initialize and run database migrations using Alembic:
```bash
cd backend
python -m alembic upgrade head
cd ..
```

---

## 3. Super Admin Account Initialization
Public registration as `SUPER_ADMIN` is prohibited. Initialize the Super Administrator via the secure CLI:
```bash
python backend/create_admin.py --name "Super Admin" --email "admin@paralipay.gov.in" --password "Admin@ParaliPay2026"
```

---

## 4. Starting the Application

### Backend
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:5173`

To create a production build:
```bash
cd frontend
npm run build
```

---

## 5. User Roles & Account Workflows

1. **Farmer (`FARMER`)**:
   - Access to **Farmer Dashboard**
   - **Stubble Estimate**: Predict harvestable stubble via ML model
   - **Burning Risk**: Assess spatial wildfire/stubble burning probability
   - **Find Buyers**: Multi-criteria buyer ranking
   - **Marketplace**: Create and manage stubble listings

2. **Biomass Buyer (`BUYER`)**:
   - Access to **Buyer Dashboard**
   - **Available Stubble**: Browse active stubble lots
   - **Express Interest**: Send purchase requests directly to farmers

3. **Government Officer (`GOVERNMENT`)**:
   - Registers with Department, Designation, and Employee ID
   - Account placed in `PENDING` verification status
   - Blocked from Government Dashboard until reviewed and approved by Super Admin
   - Once verified, unlocks **Regional Stubble Availability**, **NASA FIRMS Burning Risk Heatmap**, and **Model Diagnostics**

4. **Super Administrator (`SUPER_ADMIN`)**:
   - Access to **Super Admin Control Center**
   - Review pending government officer applications
   - Approve or reject applications (with rejection reason)
   - Monitor system metrics and marketplace activity

---

## 6. Testing

### Run All Integration & Verification Tests (27 Test Cases):
```bash
python test_auth_verification.py
```

### Run ML Bug Fixes & Precision Verification:
```bash
python test_bug_fixes.py
```