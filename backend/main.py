import os
import sys
from datetime import datetime
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI, HTTPException, status, Depends, UploadFile, File, Form, Query
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func

# Ensure backend root is on Python sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import engine, get_db, Base
from models import (
    User, UserRole, FarmerProfile, BuyerProfile, GovernmentProfile,
    VerificationStatus, StubbleListing, BuyerInterest, ListingStatus, InterestStatus,
    ContactRequest
)
from security import hash_password, verify_password, create_access_token
from dependencies import (
    get_current_user, require_farmer, require_buyer,
    require_government, require_verified_government, require_super_admin
)
from schemas.auth_schema import (
    UserRegisterRequest, UserLoginRequest, UserResponse, AuthTokenResponse,
    GovernmentVerificationItem, GovernmentRejectionRequest, SuperAdminStatsResponse,
    StubbleListingCreate, StubbleListingUpdate, StubbleListingResponse,
    BuyerInterestCreate, BuyerInterestResponse,
    ListingInterestView, ContactRequestCreate, ContactRequestResponse,
    BuyerRegisterInterestRequest, BuyerRegisterInterestResponse
)
from schemas.stubble_schema import StubblePredictionRequest, StubblePredictionResponse
from schemas.risk_schema import BurningRiskRequest, BurningRiskResponse
from schemas.buyer_schema import BuyerMatchRequest, BuyerMatchResponse, BuyerInfo
from services.model_loader import ModelManager
from services.stubble_service import StubbleService
from services.burning_risk_service import BurningRiskService
from services.buyer_matching_service import BuyerMatchingService

# Create database tables upon startup
Base.metadata.create_all(bind=engine)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(backend_dir, "uploads", "verification_docs"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Lifespan event to load models ONCE upon startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("="*60)
    print("Initializing ParaliPay Backend Services...")
    manager = ModelManager.get_instance()
    app.state.manager = manager
    app.state.stubble_service = StubbleService()
    app.state.risk_service = BurningRiskService()
    app.state.buyer_service = BuyerMatchingService()
    print("All ML models and services loaded successfully.")
    print("="*60)
    yield
    print("Shutting down ParaliPay Backend.")

app = FastAPI(
    title="ParaliPay API",
    description="Backend API powering Stubble Estimation, Burning Risk Prediction, Smart Buyer Matching, Database, Auth & Government Verification.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 1. SYSTEM HEALTH ENDPOINT
# ==============================================================================
@app.get("/api/health", tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    manager = ModelManager.get_instance()
    models_ready = (manager.stubble_model is not None) and (manager.risk_model is not None)
    
    db_connected = True
    try:
        db.execute(func.now())
    except Exception:
        db_connected = False

    return {
        "status": "ok",
        "database_connected": db_connected,
        "models_loaded": models_ready,
        "models": {
            "model_1_stubble": {
                "type": manager.stubble_metadata.get("model_type", "RandomForestRegressor"),
                "status": "ready" if manager.stubble_model else "unloaded"
            },
            "model_3_burning_risk": {
                "type": manager.risk_metadata.get("model_type", "RandomForestClassifier"),
                "status": "ready" if manager.risk_model else "unloaded"
            },
            "model_2_buyer_matching": {
                "type": "Transparent Weighted Multi-Criteria Scoring (Non-ML)",
                "status": "ready"
            }
        }
    }

# ==============================================================================
# LOCATION ENDPOINTS
# ==============================================================================
import services.location_service as loc_service

@app.get("/api/locations/states", tags=["Locations"])
def get_states():
    return loc_service.get_states()

@app.get("/api/locations/districts", tags=["Locations"])
def get_districts(state_id: str):
    return loc_service.get_districts(state_id)

@app.get("/api/locations/villages", tags=["Locations"])
def get_villages(district_id: str, q: str = None):
    return loc_service.get_villages(district_id, q)

# ==============================================================================
# 2. AUTHENTICATION ENDPOINTS
# ==============================================================================
@app.post("/api/auth/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # 1. Disallow public SUPER_ADMIN registration
    requested_role_str = req.role.upper()
    if requested_role_str == "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration as SUPER_ADMIN is prohibited. Super Administrators can only be created via secure CLI initialization."
        )

    if requested_role_str not in [UserRole.FARMER.value, UserRole.BUYER.value, UserRole.GOVERNMENT.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed registration roles: FARMER, BUYER, GOVERNMENT"
        )
    role_enum = UserRole(requested_role_str)

    # 2. Unique Email Check
    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 3. Unique Phone Check if supplied
    if req.phone:
        existing_phone = db.query(User).filter(User.phone == req.phone.strip()).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this phone number already exists."
            )

    # 4. Location Hierarchy Validation
    import services.location_service as loc_service
    if req.state_id and req.district_id:
        districts = loc_service.get_districts(req.state_id)
        if not any(d["id"] == req.district_id for d in districts):
            raise HTTPException(status_code=400, detail="Invalid district for the selected state.")
            
    if role_enum == UserRole.FARMER and req.district_id and req.village_id:
        villages = loc_service.get_villages(req.district_id)
        if not any(v["id"] == req.village_id for v in villages):
            raise HTTPException(status_code=400, detail="Invalid village for the selected district.")

    # 5. Hash password securely
    pwd_hash = hash_password(req.password)

    # 6. Create User
    new_user = User(
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        phone=req.phone.strip() if req.phone else None,
        password_hash=pwd_hash,
        role=role_enum,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # 6. Create Role-Specific Profile
    v_status = None
    if role_enum == UserRole.FARMER:
        farmer_prof = FarmerProfile(
            user_id=new_user.id,
            state=req.state or "Punjab",
            district=req.district or "Ludhiana",
            village=req.village,
            state_id=req.state_id,
            district_id=req.district_id,
            village_id=req.village_id,
            latitude=req.latitude or 30.9000,
            longitude=req.longitude or 75.8573
        )
        db.add(farmer_prof)

    elif role_enum == UserRole.BUYER:
        buyer_prof = BuyerProfile(
            user_id=new_user.id,
            business_name=req.business_name or f"{req.full_name}'s Agro Enterprise",
            buyer_type=req.buyer_type or "Biomass Aggregator",
            state=req.state or "Punjab",
            district=req.district or "Ludhiana",
            state_id=req.state_id,
            district_id=req.district_id,
            latitude=req.latitude or 30.9000,
            longitude=req.longitude or 75.8573,
            phone=req.phone,
            preferred_material=req.preferred_material or "Paddy Straw Bales"
        )
        db.add(buyer_prof)

    elif role_enum == UserRole.GOVERNMENT:
        gov_prof = GovernmentProfile(
            user_id=new_user.id,
            department=req.department or "Department of Agriculture & Farmers Welfare",
            designation=req.designation or "Agricultural Officer",
            state=req.state or "Punjab",
            district=req.district or "Ludhiana",
            state_id=req.state_id,
            district_id=req.district_id,
            employee_id=req.employee_id or f"GOV-{new_user.id:04d}",
            official_email=req.official_email or req.email,
            verification_document=req.verification_document,
            verification_status=VerificationStatus.VERIFIED
        )
        db.add(gov_prof)
        v_status = VerificationStatus.VERIFIED.value

    db.commit()
    db.refresh(new_user)

    # 7. Issue JWT Token
    token = create_access_token({"sub": str(new_user.id), "role": new_user.role.value, "email": new_user.email})

    user_resp = UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        phone=new_user.phone,
        role=new_user.role.value,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        verification_status=v_status
    )
    return AuthTokenResponse(access_token=token, token_type="bearer", user=user_resp)

@app.post("/api/auth/login", response_model=AuthTokenResponse, tags=["Authentication"])
async def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact support."
        )

    v_status = None
    r_reason = None
    if user.role == UserRole.GOVERNMENT:
        gov_prof = user.government_profile
        if gov_prof:
            v_status = gov_prof.verification_status.value
            r_reason = gov_prof.rejection_reason

    token = create_access_token({"sub": str(user.id), "role": user.role.value, "email": user.email})

    user_resp = UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
        verification_status=v_status,
        rejection_reason=r_reason
    )
    return AuthTokenResponse(access_token=token, token_type="bearer", user=user_resp)

@app.get("/api/auth/me", response_model=UserResponse, tags=["Authentication"])
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    v_status = None
    r_reason = None
    if current_user.role == UserRole.GOVERNMENT and current_user.government_profile:
        v_status = current_user.government_profile.verification_status.value
        r_reason = current_user.government_profile.rejection_reason

    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.value,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        verification_status=v_status,
        rejection_reason=r_reason
    )

@app.post("/api/auth/logout", tags=["Authentication"])
async def logout_user(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully."}

# ==============================================================================
# 3. SUPER ADMIN & GOVERNMENT VERIFICATION ENDPOINTS
# ==============================================================================
@app.get("/api/admin/stats", response_model=SuperAdminStatsResponse, tags=["Super Admin"])
async def get_super_admin_stats(
    admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role == UserRole.FARMER).count()
    total_buyers = db.query(User).filter(User.role == UserRole.BUYER).count()
    total_government = db.query(User).filter(User.role == UserRole.GOVERNMENT).count()

    pending_verif = db.query(GovernmentProfile).filter(GovernmentProfile.verification_status == VerificationStatus.PENDING).count()
    verified_gov = db.query(GovernmentProfile).filter(GovernmentProfile.verification_status == VerificationStatus.VERIFIED).count()
    rejected_gov = db.query(GovernmentProfile).filter(GovernmentProfile.verification_status == VerificationStatus.REJECTED).count()

    total_listings = db.query(StubbleListing).count()
    total_interests = db.query(BuyerInterest).count()

    return SuperAdminStatsResponse(
        total_users=total_users,
        total_farmers=total_farmers,
        total_buyers=total_buyers,
        total_government=total_government,
        pending_verifications=pending_verif,
        verified_government=verified_gov,
        rejected_government=rejected_gov,
        total_listings=total_listings,
        total_interests=total_interests
    )

@app.get("/api/admin/verifications", response_model=List[GovernmentVerificationItem], tags=["Super Admin"])
async def list_government_verifications(
    status_filter: Optional[str] = None,
    admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    query = db.query(GovernmentProfile).join(User, GovernmentProfile.user_id == User.id)
    if status_filter:
        try:
            status_enum = VerificationStatus(status_filter.upper())
            query = query.filter(GovernmentProfile.verification_status == status_enum)
        except ValueError:
            pass

    records = query.order_by(GovernmentProfile.created_at.desc()).all()
    results = []
    for r in records:
        u = r.user
        results.append(GovernmentVerificationItem(
            id=r.id,
            user_id=r.user_id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone,
            department=r.department,
            designation=r.designation,
            state=r.state,
            district=r.district,
            employee_id=r.employee_id,
            official_email=r.official_email,
            verification_document=r.verification_document,
            verification_status=r.verification_status.value,
            submitted_date=r.created_at,
            verified_at=r.verified_at,
            rejection_reason=r.rejection_reason
        ))
    return results

@app.post("/api/admin/verifications/{user_id}/approve", tags=["Super Admin"])
async def approve_government_officer(
    user_id: int,
    admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    gov_prof = db.query(GovernmentProfile).filter(GovernmentProfile.user_id == user_id).first()
    if not gov_prof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government profile not found for the specified user."
        )

    gov_prof.verification_status = VerificationStatus.VERIFIED
    gov_prof.verified_by = admin.id
    gov_prof.verified_at = datetime.utcnow()
    gov_prof.rejection_reason = None
    db.commit()

    return {
        "message": f"Government officer {gov_prof.user.full_name} has been verified successfully.",
        "user_id": user_id,
        "verification_status": VerificationStatus.VERIFIED.value
    }

@app.post("/api/admin/verifications/{user_id}/reject", tags=["Super Admin"])
async def reject_government_officer(
    user_id: int,
    req: GovernmentRejectionRequest,
    admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    gov_prof = db.query(GovernmentProfile).filter(GovernmentProfile.user_id == user_id).first()
    if not gov_prof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government profile not found for the specified user."
        )

    gov_prof.verification_status = VerificationStatus.REJECTED
    gov_prof.rejection_reason = req.rejection_reason
    gov_prof.verified_by = admin.id
    gov_prof.verified_at = datetime.utcnow()
    db.commit()

    return {
        "message": f"Government account application rejected.",
        "user_id": user_id,
        "verification_status": VerificationStatus.REJECTED.value,
        "rejection_reason": req.rejection_reason
    }

# ==============================================================================
# 4. MARKETPLACE & STUBBLE LISTINGS ENDPOINTS
# ==============================================================================
@app.post("/api/listings", response_model=StubbleListingResponse, status_code=status.HTTP_201_CREATED, tags=["Marketplace"])
async def create_stubble_listing(
    req: StubbleListingCreate,
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    listing = StubbleListing(
        farmer_id=farmer.id,
        quantity_tonnes=req.quantity_tonnes,
        asking_price_per_tonne=req.asking_price_per_tonne,
        latitude=req.latitude,
        longitude=req.longitude,
        district=req.district or (farmer.farmer_profile.district if farmer.farmer_profile else "Ludhiana"),
        state=req.state or (farmer.farmer_profile.state if farmer.farmer_profile else "Punjab"),
        village=req.village,
        crop=req.crop or "Paddy (Rice)",
        residue_type=req.residue_type or "Baled Straw",
        condition=req.condition or "Dry",
        harvest_date=req.harvest_date,
        available_until=req.available_until,
        status=ListingStatus.AVAILABLE
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return StubbleListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price_per_tonne=listing.asking_price_per_tonne,
        latitude=listing.latitude,
        longitude=listing.longitude,
        district=listing.district,
        state=listing.state,
        village=listing.village,
        crop=listing.crop,
        residue_type=listing.residue_type,
        condition=listing.condition,
        harvest_date=listing.harvest_date,
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=0
    )

@app.get("/api/listings", response_model=List[StubbleListingResponse], tags=["Marketplace"])
async def list_available_stubble_listings(
    district: Optional[str] = None,
    max_price: Optional[float] = None,
    min_qty: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(StubbleListing).filter(StubbleListing.status == ListingStatus.AVAILABLE)
    if district:
        query = query.filter(StubbleListing.district.ilike(f"%{district}%"))
    if max_price:
        query = query.filter(StubbleListing.asking_price_per_tonne <= max_price)
    if min_qty:
        query = query.filter(StubbleListing.quantity_tonnes >= min_qty)

    listings = query.order_by(StubbleListing.created_at.desc()).all()
    results = []
    for l in listings:
        results.append(StubbleListingResponse(
            id=l.id,
            farmer_id=l.farmer_id,
            farmer_name=l.farmer.full_name if l.farmer else "Farmer",
            farmer_phone=l.farmer.phone if l.farmer else None,
            quantity_tonnes=l.quantity_tonnes,
            asking_price_per_tonne=l.asking_price_per_tonne,
            latitude=l.latitude,
            longitude=l.longitude,
            district=l.district,
            state=l.state,
            village=l.village,
            crop=l.crop,
            residue_type=l.residue_type,
            condition=l.condition,
            harvest_date=l.harvest_date,
            status=l.status.value,
            created_at=l.created_at,
            interest_count=len(l.interests)
        ))
    return results

@app.get("/api/listings/my", response_model=List[StubbleListingResponse], tags=["Marketplace"])
async def get_my_farmer_listings(
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    listings = db.query(StubbleListing).filter(StubbleListing.farmer_id == farmer.id).order_by(StubbleListing.created_at.desc()).all()
    return [
        StubbleListingResponse(
            id=l.id,
            farmer_id=l.farmer_id,
            farmer_name=farmer.full_name,
            farmer_phone=farmer.phone,
            quantity_tonnes=l.quantity_tonnes,
            asking_price_per_tonne=l.asking_price_per_tonne,
            latitude=l.latitude,
            longitude=l.longitude,
            district=l.district,
            state=l.state,
            village=l.village,
            crop=l.crop,
            residue_type=l.residue_type,
            condition=l.condition,
            harvest_date=l.harvest_date,
            status=l.status.value,
            created_at=l.created_at,
            interest_count=len(l.interests)
        )
        for l in listings
    ]

@app.patch("/api/listings/{listing_id}", response_model=StubbleListingResponse, tags=["Marketplace"])
async def update_farmer_listing(
    listing_id: int,
    req: StubbleListingUpdate,
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    listing = db.query(StubbleListing).filter(StubbleListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.farmer_id != farmer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own listings.")

    if req.quantity_tonnes is not None:
        listing.quantity_tonnes = req.quantity_tonnes
    if req.asking_price_per_tonne is not None:
        listing.asking_price_per_tonne = req.asking_price_per_tonne
    if req.village is not None:
        listing.village = req.village
    if req.crop is not None:
        listing.crop = req.crop
    if req.residue_type is not None:
        listing.residue_type = req.residue_type
    if req.condition is not None:
        listing.condition = req.condition
    if req.harvest_date is not None:
        listing.harvest_date = req.harvest_date
    if req.status is not None:
        try:
            listing.status = ListingStatus(req.status.upper())
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid listing status.")

    db.commit()
    db.refresh(listing)

    return StubbleListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price_per_tonne=listing.asking_price_per_tonne,
        latitude=listing.latitude,
        longitude=listing.longitude,
        district=listing.district,
        state=listing.state,
        village=listing.village,
        crop=listing.crop,
        residue_type=listing.residue_type,
        condition=listing.condition,
        harvest_date=listing.harvest_date,
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=len(listing.interests)
    )

@app.post("/api/interests", response_model=BuyerInterestResponse, status_code=status.HTTP_201_CREATED, tags=["Marketplace"])
async def express_buyer_interest(
    req: BuyerInterestCreate,
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    listing = db.query(StubbleListing).filter(StubbleListing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.status != ListingStatus.AVAILABLE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Listing is no longer accepting offers.")

    existing = db.query(BuyerInterest).filter(
        BuyerInterest.listing_id == req.listing_id,
        BuyerInterest.buyer_id == buyer.id
    ).first()
    if existing:
        farmer_u = listing.farmer
        f_phone = farmer_u.phone if farmer_u else None
        if not f_phone and farmer_u and farmer_u.farmer_profile:
            f_phone = farmer_u.farmer_profile.phone
        return BuyerInterestResponse(
            id=existing.id,
            listing_id=listing.id,
            buyer_id=buyer.id,
            buyer_name=buyer.full_name,
            buyer_business=buyer.buyer_profile.business_name if buyer.buyer_profile else None,
            buyer_phone=buyer.phone,
            farmer_name=farmer_u.full_name if farmer_u else None,
            farmer_phone=f_phone,
            farmer_email=farmer_u.email if farmer_u else None,
            crop=listing.crop if listing and listing.crop else "Paddy Straw",
            residue_type=listing.residue_type if listing and listing.residue_type else "Baled Straw",
            village=listing.village if listing else None,
            quantity_tonnes=listing.quantity_tonnes,
            asking_price=listing.asking_price_per_tonne,
            district=listing.district,
            state=listing.state,
            message=existing.message,
            status=existing.status.value,
            created_at=existing.created_at
        )

    interest = BuyerInterest(
        listing_id=listing.id,
        buyer_id=buyer.id,
        message=req.message,
        status=InterestStatus.INTERESTED
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)

    farmer_u = listing.farmer
    f_phone = farmer_u.phone if farmer_u else None
    if not f_phone and farmer_u and farmer_u.farmer_profile:
        f_phone = farmer_u.farmer_profile.phone
    return BuyerInterestResponse(
        id=interest.id,
        listing_id=listing.id,
        buyer_id=buyer.id,
        buyer_name=buyer.full_name,
        buyer_business=buyer.buyer_profile.business_name if buyer.buyer_profile else None,
        buyer_phone=buyer.phone,
        farmer_name=farmer_u.full_name if farmer_u else None,
        farmer_phone=f_phone,
        farmer_email=farmer_u.email if farmer_u else None,
        crop=listing.crop if listing and listing.crop else "Paddy Straw",
        residue_type=listing.residue_type if listing and listing.residue_type else "Baled Straw",
        village=listing.village if listing else None,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price=listing.asking_price_per_tonne,
        district=listing.district,
        state=listing.state,
        message=interest.message,
        status=interest.status.value,
        created_at=interest.created_at
    )

@app.get("/api/interests/my", response_model=List[BuyerInterestResponse], tags=["Marketplace"])
async def get_my_buyer_interests(
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    interests = db.query(BuyerInterest).filter(BuyerInterest.buyer_id == buyer.id).order_by(BuyerInterest.created_at.desc()).all()
    results = []
    for i in interests:
        farmer_user = i.listing.farmer if i.listing else None
        farmer_phone = farmer_user.phone if farmer_user else None
        if not farmer_phone and farmer_user and farmer_user.farmer_profile:
            farmer_phone = farmer_user.farmer_profile.phone
        farmer_email = farmer_user.email if farmer_user else None
        results.append(BuyerInterestResponse(
            id=i.id,
            listing_id=i.listing.id if i.listing else 0,
            buyer_id=buyer.id,
            buyer_name=buyer.full_name,
            buyer_business=buyer.buyer_profile.business_name if buyer.buyer_profile else None,
            buyer_phone=buyer.phone,
            farmer_name=farmer_user.full_name if farmer_user else "Unknown Farmer",
            farmer_phone=farmer_phone,
            farmer_email=farmer_email,
            crop=i.listing.crop if i.listing and i.listing.crop else "Paddy Straw",
            residue_type=i.listing.residue_type if i.listing and i.listing.residue_type else "Baled Straw",
            village=i.listing.village if i.listing else None,
            quantity_tonnes=i.listing.quantity_tonnes if i.listing else 0.0,
            asking_price=i.listing.asking_price_per_tonne if i.listing else 0.0,
            district=i.listing.district if i.listing else None,
            state=i.listing.state if i.listing else None,
            message=i.message,
            status=i.status.value,
            created_at=i.created_at
        ))
    return results

@app.patch("/api/interests/{interest_id}/status", response_model=BuyerInterestResponse, tags=["Marketplace"])
async def update_interest_status(
    interest_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interest = db.query(BuyerInterest).filter(BuyerInterest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Deal not found")
    is_buyer = interest.buyer_id == current_user.id
    is_farmer = interest.listing and interest.listing.farmer_id == current_user.id
    if not (is_buyer or is_farmer):
        raise HTTPException(status_code=403, detail="Not authorized to update this deal")

    new_status_str = status_data.get("status", "").upper()
    try:
        new_status = InterestStatus(new_status_str)
        interest.status = new_status
        db.commit()
        db.refresh(interest)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status_str}")

    farmer_user = interest.listing.farmer if interest.listing else None
    farmer_phone = farmer_user.phone if farmer_user else None
    if not farmer_phone and farmer_user and farmer_user.farmer_profile:
        farmer_phone = farmer_user.farmer_profile.phone
    farmer_email = farmer_user.email if farmer_user else None

    return BuyerInterestResponse(
        id=interest.id,
        listing_id=interest.listing.id if interest.listing else 0,
        buyer_id=interest.buyer_id,
        buyer_name=interest.buyer.full_name if interest.buyer else "Buyer",
        buyer_business=interest.buyer.buyer_profile.business_name if (interest.buyer and interest.buyer.buyer_profile) else None,
        buyer_phone=interest.buyer.phone if interest.buyer else None,
        farmer_name=farmer_user.full_name if farmer_user else "Unknown Farmer",
        farmer_phone=farmer_phone,
        farmer_email=farmer_email,
        crop=interest.listing.crop if interest.listing and interest.listing.crop else "Paddy Straw",
        residue_type=interest.listing.residue_type if interest.listing and interest.listing.residue_type else "Baled Straw",
        village=interest.listing.village if interest.listing else None,
        quantity_tonnes=interest.listing.quantity_tonnes if interest.listing else 0.0,
        asking_price=interest.listing.asking_price_per_tonne if interest.listing else 0.0,
        district=interest.listing.district if interest.listing else None,
        state=interest.listing.state if interest.listing else None,
        message=interest.message,
        status=interest.status.value,
        created_at=interest.created_at
    )

@app.get("/api/listings/my/interests", response_model=List[ListingInterestView], tags=["Marketplace"])
async def get_farmer_listing_interests(
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    """Farmer views all buyer expressions of interest on their listings (activity feed)."""
    farmer_listing_ids = [l.id for l in db.query(StubbleListing).filter(StubbleListing.farmer_id == farmer.id).all()]
    if not farmer_listing_ids:
        return []

    interests = (
        db.query(BuyerInterest)
        .filter(BuyerInterest.listing_id.in_(farmer_listing_ids))
        .order_by(BuyerInterest.created_at.desc())
        .all()
    )

    results = []
    for i in interests:
        buyer_user = db.query(User).filter(User.id == i.buyer_id).first()
        results.append(ListingInterestView(
            interest_id=i.id,
            listing_id=i.listing_id,
            buyer_id=i.buyer_id,
            buyer_name=buyer_user.full_name if buyer_user else "Unknown",
            buyer_business=buyer_user.buyer_profile.business_name if buyer_user and buyer_user.buyer_profile else None,
            buyer_phone=buyer_user.phone if buyer_user else None,
            message=i.message,
            status=i.status.value,
            interest_date=i.created_at,
            listing_qty=i.listing.quantity_tonnes,
            listing_price=i.listing.asking_price_per_tonne,
            listing_district=i.listing.district
        ))
    return results

@app.post("/api/contacts", response_model=ContactRequestResponse, status_code=201, tags=["Contacts"])
async def farmer_contact_buyer(
    req: ContactRequestCreate,
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    """Farmer sends an on-site contact message / inquiry to a buyer (registered or from matching results)."""
    target_buyer_id = None
    target_buyer = None
    if req.buyer_id is not None:
        try:
            raw_id = str(req.buyer_id).replace("reg_", "")
            int_id = int(raw_id)
            target_buyer = db.query(User).filter(User.id == int_id, User.role == UserRole.BUYER).first()
            if not target_buyer:
                bp_match = db.query(BuyerProfile).filter(BuyerProfile.id == int_id).first()
                if bp_match:
                    target_buyer = bp_match.user
            if target_buyer:
                target_buyer_id = target_buyer.id
        except (ValueError, TypeError):
            pass

    # Find farmer's active listing if listing_id provided or latest listing
    f_listing = None
    if req.listing_id:
        f_listing = db.query(StubbleListing).filter(StubbleListing.id == req.listing_id).first()
    if not f_listing:
        f_listing = db.query(StubbleListing).filter(StubbleListing.farmer_id == farmer.id).order_by(StubbleListing.created_at.desc()).first()

    buyer_name = target_buyer.full_name if target_buyer else (req.buyer_name_ref or f"Buyer {req.buyer_id or ''}")
    stubble_qty_val = req.stubble_qty or (f_listing.quantity_tonnes if f_listing else 50.0)

    contact = ContactRequest(
        farmer_id=farmer.id,
        buyer_id=target_buyer_id,
        listing_id=f_listing.id if f_listing else req.listing_id,
        buyer_name_ref=buyer_name,
        message=req.message or f"Hi, I am {farmer.full_name}. I have {stubble_qty_val} tonnes of stubble available and saw your buying interest.",
        stubble_qty=stubble_qty_val,
        status="INTERESTED",
        is_read=False
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    return ContactRequestResponse(
        id=contact.id,
        farmer_id=contact.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        farmer_email=farmer.email,
        buyer_id=contact.buyer_id,
        buyer_name_ref=contact.buyer_name_ref,
        message=contact.message,
        stubble_qty=contact.stubble_qty,
        listing_id=contact.listing_id,
        crop=f_listing.crop if f_listing and f_listing.crop else "Paddy Straw",
        residue_type=f_listing.residue_type if f_listing and f_listing.residue_type else "Baled Straw",
        price=f_listing.asking_price_per_tonne if f_listing else None,
        district=f_listing.district if f_listing else (farmer.farmer_profile.district if farmer.farmer_profile else "Ludhiana"),
        state=f_listing.state if f_listing else (farmer.farmer_profile.state if farmer.farmer_profile else "Punjab"),
        status=contact.status or "INTERESTED",
        is_read=contact.is_read,
        created_at=contact.created_at
    )

@app.get("/api/contacts/my", response_model=List[ContactRequestResponse], tags=["Contacts"])
async def get_my_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Farmer sees their sent contacts. Buyer sees contacts/inquiries received from farmers."""
    if current_user.role == UserRole.FARMER:
        contacts = (
            db.query(ContactRequest)
            .filter(ContactRequest.farmer_id == current_user.id)
            .order_by(ContactRequest.created_at.desc())
            .all()
        )
    elif current_user.role == UserRole.BUYER:
        contacts = (
            db.query(ContactRequest)
            .filter(
                (ContactRequest.buyer_id == current_user.id) |
                (ContactRequest.buyer_id.is_(None))
            )
            .order_by(ContactRequest.created_at.desc())
            .all()
        )
        # Mark unread
        for c in contacts:
            if not c.is_read:
                c.is_read = True
        db.commit()
    else:
        contacts = []

    results = []
    for c in contacts:
        farmer_user = db.query(User).filter(User.id == c.farmer_id).first()
        f_listing = None
        if c.listing_id:
            f_listing = db.query(StubbleListing).filter(StubbleListing.id == c.listing_id).first()
        if not f_listing and farmer_user:
            f_listing = db.query(StubbleListing).filter(StubbleListing.farmer_id == farmer_user.id).order_by(StubbleListing.created_at.desc()).first()

        district_val = f_listing.district if f_listing else (farmer_user.farmer_profile.district if (farmer_user and farmer_user.farmer_profile) else "Ludhiana")
        state_val = f_listing.state if f_listing else (farmer_user.farmer_profile.state if (farmer_user and farmer_user.farmer_profile) else "Punjab")

        results.append(ContactRequestResponse(
            id=c.id,
            farmer_id=c.farmer_id,
            farmer_name=farmer_user.full_name if farmer_user else "Farmer",
            farmer_phone=farmer_user.phone if farmer_user else None,
            farmer_email=farmer_user.email if farmer_user else None,
            farmer_location=f"{district_val}, {state_val}",
            buyer_id=c.buyer_id,
            buyer_name_ref=c.buyer_name_ref,
            message=c.message,
            stubble_qty=c.stubble_qty or (f_listing.quantity_tonnes if f_listing else 50.0),
            listing_id=f_listing.id if f_listing else c.listing_id,
            crop=f_listing.crop if f_listing and f_listing.crop else "Paddy Straw",
            residue_type=f_listing.residue_type if f_listing and f_listing.residue_type else "Baled Straw",
            price=f_listing.asking_price_per_tonne if f_listing else 4550.0,
            district=district_val,
            state=state_val,
            status=c.status or "INTERESTED",
            is_read=c.is_read,
            created_at=c.created_at
        ))
    return results

@app.patch("/api/contacts/{contact_id}/status", response_model=ContactRequestResponse, tags=["Contacts"])
async def update_contact_status(
    contact_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(ContactRequest).filter(ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    new_status = status_data.get("status", "ACCEPTED").upper()
    contact.status = new_status
    db.commit()
    db.refresh(contact)

    farmer_user = db.query(User).filter(User.id == contact.farmer_id).first()
    f_listing = None
    if contact.listing_id:
        f_listing = db.query(StubbleListing).filter(StubbleListing.id == contact.listing_id).first()
    district_val = f_listing.district if f_listing else (farmer_user.farmer_profile.district if (farmer_user and farmer_user.farmer_profile) else "Ludhiana")
    state_val = f_listing.state if f_listing else (farmer_user.farmer_profile.state if (farmer_user and farmer_user.farmer_profile) else "Punjab")

    return ContactRequestResponse(
        id=contact.id,
        farmer_id=contact.farmer_id,
        farmer_name=farmer_user.full_name if farmer_user else "Farmer",
        farmer_phone=farmer_user.phone if farmer_user else None,
        farmer_email=farmer_user.email if farmer_user else None,
        farmer_location=f"{district_val}, {state_val}",
        buyer_id=contact.buyer_id,
        buyer_name_ref=contact.buyer_name_ref,
        message=contact.message,
        stubble_qty=contact.stubble_qty,
        listing_id=contact.listing_id,
        crop=f_listing.crop if f_listing and f_listing.crop else "Paddy Straw",
        residue_type=f_listing.residue_type if f_listing and f_listing.residue_type else "Baled Straw",
        price=f_listing.asking_price_per_tonne if f_listing else 4550.0,
        district=district_val,
        state=state_val,
        status=contact.status,
        is_read=contact.is_read,
        created_at=contact.created_at
    )

# ==============================================================================
# 5. ML PREDICTIONS & BUYER MATCHING (PRESERVED)
# ==============================================================================
@app.post("/api/stubble/predict", response_model=StubblePredictionResponse, tags=["Stubble Estimation"])
async def predict_stubble(request: StubblePredictionRequest):
    """Predicts harvestable paddy stubble (in metric tonnes) from farmer parcel information."""
    try:
        service = app.state.stubble_service
        result = service.predict_stubble(
            area=request.Area,
            state_name=request.State_Name,
            district_name=request.District_Name,
            crop_year=request.Crop_Year or 2024,
            season=request.Season or "Kharif",
            district_hist_yield=request.district_hist_yield
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error in Stubble Prediction model: {str(e)}"
        )

@app.post("/api/risk/predict", response_model=BurningRiskResponse, tags=["Burning Risk"])
async def predict_burning_risk(request: BurningRiskRequest):
    """Predicts the probability of stubble burning occurrence P(fire=1) and maps to operational risk tiers."""
    try:
        service = app.state.risk_service
        result = service.predict_risk(
            latitude=request.latitude,
            longitude=request.longitude,
            date_str=request.date,
            lag_fire_days_past_3d=request.lag_fire_days_past_3d,
            lag_fire_days_past_7d=request.lag_fire_days_past_7d,
            prior_cumulative_fires=request.prior_cumulative_fires
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error in Burning Risk model: {str(e)}"
        )


# ==============================================================================
# BUYER REGISTRATION & REQUIREMENTS PROFILE (Register Interest)
# ==============================================================================
DISTRICT_COORDS_MAP = {
    # Punjab
    'Ludhiana': (30.9000, 75.8573),
    'Amritsar': (31.6340, 74.8723),
    'Patiala': (30.3398, 76.3869),
    'Bathinda': (30.2110, 74.9455),
    'Jalandhar': (31.3260, 75.5762),
    'Sangrur': (30.2458, 75.8421),
    'Firozpur': (30.9237, 74.6114),
    'Moga': (30.8165, 75.1717),
    'Hoshiarpur': (31.5273, 75.9149),
    'Mansa': (29.9834, 75.3929),
    'Muktsar': (30.4762, 74.5173),
    # Haryana
    'Karnal': (29.6857, 76.9905),
    'Ambala': (30.3782, 76.7767),
    'Kurukshetra': (29.9695, 76.8783),
    'Panipat': (29.3909, 76.9708),
    'Hisar': (29.1492, 75.7217),
    'Fatehabad': (29.5147, 75.4526),
    'Sirsa': (29.5349, 75.0289),
    'Rohtak': (28.8955, 76.6066),
    'Kaithal': (29.7560, 76.5510),
    # Rajasthan
    'Sri Ganganagar': (29.9038, 73.8772),
    'Hanumangarh': (29.5810, 74.3294),
    'Alwar': (27.5530, 76.6346),
    'Kota': (25.2138, 75.8648),
    'Bikaner': (28.0229, 73.3119),
    'Bharatpur': (27.2152, 77.5030),
    'Jaipur': (26.9124, 75.7873),
}

def _get_registered_buyers_as_candidates(db: Session) -> List[Dict[str, Any]]:
    db_buyers = db.query(BuyerProfile).join(User).filter(User.is_active == True).all()
    candidates = []
    for bp in db_buyers:
        if not bp.business_name or (bp.required_quantity_tonnes or 0) <= 0:
            continue
        b_name = bp.business_name or (bp.user.full_name if bp.user else "Biomass Buyer")
        candidates.append({
            "buyer_id": f"reg_{bp.id}",
            "buyer_name": b_name,
            "contact_number": bp.phone or (bp.user.phone if bp.user else None),
            "buyer_type": bp.buyer_type or "Biomass Aggregator",
            "latitude": float(bp.latitude or 30.9000),
            "longitude": float(bp.longitude or 75.8573),
            "offered_price": float(bp.budget_per_tonne or 2000.0),
            "capacity_tonnes": float(bp.required_quantity_tonnes or 100.0),
            "is_available": True,
            "preferred_material": bp.preferred_material or "Paddy Straw Bales",
            "district": bp.district or "Ludhiana",
            "state": bp.state or "Punjab",
            "verification_status": bp.verification_status or "PENDING",
            "is_certified": bool(bp.verification_status in ["VERIFIED", "CERTIFIED"] or bp.is_certified),
        })
    return candidates

@app.get("/api/buyer/profile", response_model=BuyerRegisterInterestResponse, tags=["Buyer Marketplace"])
async def get_buyer_registration(
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    """Fetches the logged-in buyer's permanent registered profile & requirements."""
    bp = db.query(BuyerProfile).filter(BuyerProfile.user_id == buyer.id).first()
    if not bp:
        bp = BuyerProfile(
            user_id=buyer.id,
            business_name=f"{buyer.full_name}'s Enterprise",
            buyer_type="Biomass Aggregator",
            state="Punjab",
            district="Ludhiana",
            phone=buyer.phone,
            preferred_material="Paddy Straw Bales",
            required_quantity_tonnes=100.0,
            max_distance_km=100.0,
            budget_per_tonne=2000.0,
            purchase_frequency="Regular / Seasonal",
            verification_status="PENDING",
            is_certified=False
        )
        db.add(bp)
        db.commit()
        db.refresh(bp)
    
    return BuyerRegisterInterestResponse(
        user_id=buyer.id,
        full_name=buyer.full_name,
        email=buyer.email,
        phone=buyer.phone or bp.phone,
        business_name=bp.business_name,
        buyer_type=bp.buyer_type or "Biomass Aggregator",
        preferred_material=bp.preferred_material or "Paddy Straw Bales",
        required_quantity_tonnes=bp.required_quantity_tonnes or 100.0,
        state=bp.state or "Punjab",
        district=bp.district or "Ludhiana",
        location_address=bp.location_address,
        max_distance_km=bp.max_distance_km or 100.0,
        budget_per_tonne=bp.budget_per_tonne or 2000.0,
        purchase_frequency=bp.purchase_frequency or "Regular / Seasonal",
        additional_requirements=bp.additional_requirements,
        verification_status=bp.verification_status or "PENDING",
        is_certified=bool(bp.is_certified or bp.verification_status == "VERIFIED"),
        document_type=bp.document_type,
        document_id_number=bp.document_id_number,
        document_url=bp.document_url,
        created_at=bp.created_at,
        updated_at=bp.updated_at
    )

@app.post("/api/buyer/register-interest", response_model=BuyerRegisterInterestResponse, tags=["Buyer Marketplace"])
async def register_buyer_interest(
    req: BuyerRegisterInterestRequest,
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    """Registers or updates the buyer's permanent profile & requirements without creating duplicate accounts."""
    if req.full_name:
        buyer.full_name = req.full_name
    if req.phone:
        buyer.phone = req.phone
    
    bp = db.query(BuyerProfile).filter(BuyerProfile.user_id == buyer.id).first()
    if not bp:
        bp = BuyerProfile(user_id=buyer.id, business_name=req.business_name)
        db.add(bp)
    
    bp.business_name = req.business_name
    bp.buyer_type = req.buyer_type
    bp.preferred_material = req.preferred_material
    bp.required_quantity_tonnes = req.required_quantity_tonnes
    bp.state = req.state
    bp.district = req.district
    bp.location_address = req.location_address
    bp.max_distance_km = req.max_distance_km
    bp.budget_per_tonne = req.budget_per_tonne
    bp.purchase_frequency = req.purchase_frequency
    bp.additional_requirements = req.additional_requirements
    bp.document_type = req.document_type
    bp.document_id_number = req.document_id_number
    bp.document_url = req.document_url
    bp.phone = req.phone or buyer.phone
    
    if req.district in DISTRICT_COORDS_MAP:
        bp.latitude, bp.longitude = DISTRICT_COORDS_MAP[req.district]
        
    # Maintain or set status
    if not bp.verification_status or bp.verification_status == "REJECTED":
        bp.verification_status = "PENDING"
        bp.is_certified = False
    elif bp.verification_status == "VERIFIED":
        bp.is_certified = True
    else:
        bp.verification_status = "PENDING"
        bp.is_certified = False

    bp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bp)
    db.refresh(buyer)

    return BuyerRegisterInterestResponse(
        user_id=buyer.id,
        full_name=buyer.full_name,
        email=buyer.email,
        phone=buyer.phone or bp.phone,
        business_name=bp.business_name,
        buyer_type=bp.buyer_type,
        preferred_material=bp.preferred_material,
        required_quantity_tonnes=bp.required_quantity_tonnes,
        state=bp.state,
        district=bp.district,
        location_address=bp.location_address,
        max_distance_km=bp.max_distance_km,
        budget_per_tonne=bp.budget_per_tonne,
        purchase_frequency=bp.purchase_frequency,
        additional_requirements=bp.additional_requirements,
        verification_status=bp.verification_status,
        is_certified=bool(bp.is_certified or bp.verification_status == "VERIFIED"),
        document_type=bp.document_type,
        document_id_number=bp.document_id_number,
        document_url=bp.document_url,
        created_at=bp.created_at,
        updated_at=bp.updated_at
    )


@app.delete("/api/buyer/profile", tags=["Buyer Marketplace"])
async def delete_buyer_registration(
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    """Deletes the buyer registration so they are no longer listed in Search Buyers."""
    bp = db.query(BuyerProfile).filter(BuyerProfile.user_id == buyer.id).first()
    if bp:
        bp.business_name = ""
        bp.preferred_material = ""
        bp.required_quantity_tonnes = 0.0
        bp.budget_per_tonne = 0.0
        bp.additional_requirements = None
        bp.location_address = None
        bp.verification_status = None
        bp.is_certified = False
        bp.updated_at = datetime.utcnow()
        db.commit()
    return {"message": "Buyer registration deleted successfully"}

@app.post("/api/buyers/match", response_model=BuyerMatchResponse, tags=["Buyer Matching"])
async def match_buyers(request: BuyerMatchRequest, db: Session = Depends(get_db)):
    """Ranks available biomass buyers including permanently registered certified buyers."""
    try:
        service = app.state.buyer_service
        db_candidates = _get_registered_buyers_as_candidates(db)
        if request.buyers:
            combined_candidates = [b.dict() for b in request.buyers] + db_candidates
        else:
            combined_candidates = db_candidates + (service.demo_buyers or [])

        result = service.match_buyers(
            stubble_quantity=request.stubble_quantity,
            farmer_latitude=request.farmer_latitude,
            farmer_longitude=request.farmer_longitude,
            max_distance_km=request.max_distance_km or 120.0,
            custom_buyers=combined_candidates
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in Buyer Matching scoring engine: {str(e)}"
        )

@app.get("/api/buyers", response_model=List[BuyerInfo], tags=["Buyer Matching"])
async def get_demo_buyers(db: Session = Depends(get_db)):
    """Returns the active biomass buyers registered in directory including certified registered buyers."""
    service = app.state.buyer_service
    db_candidates = _get_registered_buyers_as_candidates(db)
    # Return registered buyers first, then demo buyers
    seen_ids = set()
    combined = []
    for b in db_candidates + (service.demo_buyers or []):
        bid = b.get("buyer_id")
        if bid not in seen_ids:
            seen_ids.add(bid)
            combined.append(b)
    return combined

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


@app.delete("/api/listings/{listing_id}", tags=["Marketplace"])
async def delete_farmer_listing(
    listing_id: int,
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    listing = db.query(StubbleListing).filter(StubbleListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.farmer_id != farmer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own listings.")
    
    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully"}

# ==============================================================================
# PRODUCTION STATIC FRONTEND MOUNTING (Unified Single-Container Mode)
# ==============================================================================
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if not os.path.exists(frontend_dist):
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"status": "ok", "message": "ParaliPay API running"}

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Not Found")

