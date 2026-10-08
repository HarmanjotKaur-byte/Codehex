# Phase 10: Database, Real Authentication, Government Verification & Super Admin

## 1. Database Architecture
ParaliPay utilizes **SQLAlchemy 2.0 ORM** with **Alembic migrations** for complete schema versioning and reproducibility.
- **Production Engine**: PostgreSQL (configured via `DATABASE_URL=postgresql://user:password@localhost:5432/paralipay_db`)
- **Development/Fallback Engine**: SQLite (`sqlite:///.../paralipay.db`)
- Absolute path resolution ensures seamless execution whether launched from the repository root or the `backend/` directory.

---

## 2. PostgreSQL Setup
To connect to PostgreSQL in staging or production:
1. Install PostgreSQL and create the database:
   ```bash
   createdb paralipay_db
   ```
2. Configure `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/paralipay_db
   JWT_SECRET_KEY=your_secure_random_key_here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```
3. Run Alembic migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

---

## 3. Database Tables & Schema Overview

| Table | Primary Key | Foreign Keys | Key Columns |
|---|---|---|---|
| `users` | `id` (Integer) | None | `full_name`, `email` (Unique), `phone` (Unique), `password_hash`, `role` (Enum), `is_active`, `created_at`, `updated_at` |
| `farmer_profiles` | `id` (Integer) | `user_id` -> `users.id` | `state`, `district`, `village`, `latitude`, `longitude`, timestamps |
| `buyer_profiles` | `id` (Integer) | `user_id` -> `users.id` | `business_name`, `buyer_type`, `state`, `district`, `latitude`, `longitude`, `phone`, `preferred_material`, timestamps |
| `government_profiles` | `id` (Integer) | `user_id` -> `users.id`, `verified_by` -> `users.id` | `department`, `designation`, `state`, `district`, `employee_id`, `official_email`, `verification_document`, `verification_status` (Enum), `verified_by`, `verified_at`, `rejection_reason`, timestamps |
| `stubble_listings` | `id` (Integer) | `farmer_id` -> `users.id` | `quantity_tonnes`, `asking_price_per_tonne`, `latitude`, `longitude`, `district`, `state`, `available_from`, `available_until`, `status` (Enum), timestamps |
| `buyer_interests` | `id` (Integer) | `listing_id` -> `stubble_listings.id`, `buyer_id` -> `users.id` | `message`, `status` (Enum), timestamps |

---

## 4. Entity Relationships
- **User 1 : 1 FarmerProfile** (cascade on delete)
- **User 1 : 1 BuyerProfile** (cascade on delete)
- **User 1 : 1 GovernmentProfile** (cascade on delete)
- **User (Farmer) 1 : N StubbleListing**
- **StubbleListing 1 : N BuyerInterest**
- **User (Buyer) 1 : N BuyerInterest**
- **GovernmentProfile N : 1 User (Super Admin)** via `verified_by`

---

## 5. User Roles & Access Control
- `FARMER`: Access to Farmer Dashboard, Stubble ML Estimation, Burning Risk Analysis, Buyer Matching, Marketplace Listing Creation, and Listing Management.
- `BUYER`: Access to Buyer Dashboard, Stubble Catalog, Direct Biomass Buying, and Expressing Interest on Stubble Listings.
- `GOVERNMENT`: Access strictly gated by `verification_status`.
  - `PENDING`: Redirected to Verification Pending screen (`/api/auth/me` returns `verification_status: "PENDING"`, privileged routes return 403).
  - `UNDER_REVIEW`: Status view displayed.
  - `REJECTED`: Gated to Verification Rejected view with explicit `rejection_reason`.
  - `VERIFIED`: Unlocks full Government Dashboard (Regional Stubble Availability, NASA FIRMS Burning Risk Heatmap, ML Model Diagnostics).
- `SUPER_ADMIN`: Cannot be registered publicly. Manages executive controls, officer verification queue, approve/reject operations, and system-wide account metrics.

---

## 6. Registration Flow
- **Endpoint**: `POST /api/auth/register`
- **Public Roles**: Only `FARMER`, `BUYER`, and `GOVERNMENT` are accepted. Registration requests specifying `SUPER_ADMIN` are rejected with HTTP 400.
- Email addresses are strictly deduplicated.
- Passwords are validated for a minimum length of 8 characters.
- Upon registration:
  - Secure bcrypt hash is computed and stored.
  - Associated profile (`FarmerProfile`, `BuyerProfile`, or `GovernmentProfile`) is initialized within a single atomic database transaction.
  - Government profiles default to `verification_status = PENDING`.
  - A signed JWT Bearer access token is issued immediately.

---

## 7. Login Flow & JWT Authentication
- **Endpoint**: `POST /api/auth/login`
- Accepts `email` and `password`.
- Passwords verified with constant-time bcrypt checks.
- Returns JWT Bearer token:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "full_name": "Dr. Manpreet Singh",
      "email": "officer@punjab.gov.in",
      "role": "GOVERNMENT",
      "verification_status": "PENDING"
    }
  }
  ```
- Password hashes and plain passwords are never returned in responses.

---

## 8. Role-Based Authorization Dependencies
FastAPI dependency injection enforces access control:
- `get_current_user`: Decodes JWT Bearer token, validates expiry (`exp`), extracts user record.
- `require_farmer`: Rejects non-farmer callers with HTTP 403.
- `require_buyer`: Rejects non-buyer callers with HTTP 403.
- `require_government`: Ensures user has role `GOVERNMENT`.
- `require_verified_government`: Enforces both role `GOVERNMENT` and `verification_status == VERIFIED`.
- `require_super_admin`: Restricts execution to `SUPER_ADMIN`.

---

## 9. Government Verification Workflow
1. Government officer registers via public form.
2. Account created with `verification_status = PENDING`.
3. When the officer logs in, frontend detects `PENDING` and redirects to `VerificationPendingPage`.
4. Super Admin logs into `/api/admin/verifications` queue.
5. Super Admin clicks **Approve** -> Backend updates `verification_status = VERIFIED`, sets `verified_by = admin.id`, `verified_at = utcnow()`.
6. Alternatively, Super Admin clicks **Reject** with mandatory `rejection_reason` -> Backend marks `verification_status = REJECTED`.
7. Once verified, the officer unlocks the complete Government Dashboard.

---

## 10. Marketplace Database & Buyer Interests
- `POST /api/listings`: Farmers create real stubble listings with quantity, price, coordinates, and district.
- `GET /api/listings`: Public/Buyer searchable catalog with district, max price, and min quantity filters.
- `GET /api/listings/my`: Farmers retrieve their own listings and count of received buyer interests.
- `PATCH /api/listings/{id}`: Farmers modify price, quantity, or mark as RESERVED/SOLD/CANCELLED (strictly guarded against modifications by other users).
- `POST /api/interests`: Biomass buyers express commercial purchase interest.
- `GET /api/interests/my`: Buyers track active expressions of interest.

---

## 11. Super Admin CLI Initialization
Super Admin accounts are created strictly out-of-band via CLI:
```bash
python backend/create_admin.py --name "Super Admin" --email "admin@paralipay.gov.in" --password "Admin@ParaliPay2026"
```
Or interactively:
```bash
python backend/create_admin.py
```

---

## 12. Verification & Test Suite Summary
All 27 integration tests specified in Sections 29, 30, and 31 passed:
```
Ran 27 tests in 4.248s: OK
```
- Authentication tests (1-10): PASS
- Government verification tests (11-21): PASS
- Marketplace & RBAC tests (22-27): PASS
- Stubble ML Regression & Burning Risk ML: PASS
- Buyer Matching scoring engine: PASS
- Frontend Vite production build: PASS (1616 modules transformed)
