import os
import sys
from datetime import datetime
from typing import List, Optional

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
    VerificationStatus, StubbleListing, BuyerInterest, ListingStatus, InterestStatus
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
    BuyerInterestCreate, BuyerInterestResponse
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

app = FastAPI(
    title="ParaliPay API",
    description="Backend API powering Stubble Estimation, Burning Risk Prediction, Smart Buyer Matching, Database, Auth & Government Verification.",
    version="2.0.0"
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
def health_check(db: Session = Depends(get_db)):
    manager = ModelManager.get_instance()
    models_ready = (manager.stubble_model is not None) and (manager.risk_model is not None)
    
    # DB connection check
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
# 2. AUTHENTICATION ENDPOINTS
# ==============================================================================
@app.post("/api/auth/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
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

    # 4. Hash password securely
    pwd_hash = hash_password(req.password)

    # 5. Create User
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
            latitude=req.latitude or 30.9000,
            longitude=req.longitude or 75.8573,
            phone=req.phone,
            preferred_material=req.preferred_material or "Paddy Straw Bales"
        )
        db.add(buyer_prof)

    elif role_enum == UserRole.GOVERNMENT:
        gov_prof = GovernmentProfile(
            user_id=new_user.id,
            department=req.department or "Agriculture / Pollution Control",
            designation=req.designation or "Agricultural Officer",
            state=req.state or "Punjab",
            district=req.district or "Ludhiana",
            employee_id=req.employee_id or f"GOV-{new_user.id:04d}",
            official_email=req.official_email or req.email,
            verification_document=req.verification_document,
            verification_status=VerificationStatus.PENDING
        )
        db.add(gov_prof)
        v_status = VerificationStatus.PENDING.value

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
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
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

    # Verification status for Government
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
def get_current_user_profile(current_user: User = Depends(get_current_user)):
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
def logout_user(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully."}

# ==============================================================================
# 3. SUPER ADMIN & GOVERNMENT VERIFICATION ENDPOINTS
# ==============================================================================
@app.get("/api/admin/stats", response_model=SuperAdminStatsResponse, tags=["Super Admin"])
def get_super_admin_stats(
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
def list_government_verifications(
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
def approve_government_officer(
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
def reject_government_officer(
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

@app.post("/api/government/submit-document", tags=["Government"])
async def upload_verification_document(
    file: UploadFile = File(...),
    gov_user: User = Depends(require_government),
    db: Session = Depends(get_db)
):
    allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed formats: {', '.join(allowed_extensions)}"
        )

    safe_filename = f"gov_doc_{gov_user.id}_{int(datetime.utcnow().timestamp())}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 10MB size limit.")

    with open(dest_path, "wb") as f:
        f.write(contents)

    gov_prof = gov_user.government_profile
    if gov_prof:
        gov_prof.verification_document = safe_filename
        gov_prof.verification_status = VerificationStatus.PENDING
        db.commit()

    return {"message": "Document uploaded successfully. Application is pending review.", "filename": safe_filename}

# ==============================================================================
# 4. MARKETPLACE & STUBBLE LISTINGS ENDPOINTS
# ==============================================================================
@app.post("/api/listings", response_model=StubbleListingResponse, status_code=status.HTTP_201_CREATED, tags=["Marketplace"])
def create_stubble_listing(
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
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=0
    )

@app.get("/api/listings", response_model=List[StubbleListingResponse], tags=["Marketplace"])
def list_available_stubble_listings(
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
            farmer_name=l.farmer.full_name,
            farmer_phone=l.farmer.phone,
            quantity_tonnes=l.quantity_tonnes,
            asking_price_per_tonne=l.asking_price_per_tonne,
            latitude=l.latitude,
            longitude=l.longitude,
            district=l.district,
            state=l.state,
            status=l.status.value,
            created_at=l.created_at,
            interest_count=len(l.interests)
        ))
    return results

@app.get("/api/listings/my", response_model=List[StubbleListingResponse], tags=["Marketplace"])
def get_my_farmer_listings(
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
            status=l.status.value,
            created_at=l.created_at,
            interest_count=len(l.interests)
        )
        for l in listings
    ]

@app.patch("/api/listings/{listing_id}", response_model=StubbleListingResponse, tags=["Marketplace"])
def update_farmer_listing(
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
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=len(listing.interests)
    )

@app.post("/api/interests", response_model=BuyerInterestResponse, status_code=status.HTTP_201_CREATED, tags=["Marketplace"])
def express_buyer_interest(
    req: BuyerInterestCreate,
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    listing = db.query(StubbleListing).filter(StubbleListing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.status != ListingStatus.AVAILABLE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Listing is no longer accepting offers.")

    # Check for existing interest from this buyer
    existing = db.query(BuyerInterest).filter(
        BuyerInterest.listing_id == req.listing_id,
        BuyerInterest.buyer_id == buyer.id
    ).first()
    if existing:
        return BuyerInterestResponse(
            id=existing.id,
            listing_id=listing.id,
            buyer_id=buyer.id,
            buyer_name=buyer.full_name,
            buyer_business=buyer.buyer_profile.business_name if buyer.buyer_profile else None,
            buyer_phone=buyer.phone,
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

    return BuyerInterestResponse(
        id=interest.id,
        listing_id=listing.id,
        buyer_id=buyer.id,
        buyer_name=buyer.full_name,
        buyer_business=buyer.buyer_profile.business_name if buyer.buyer_profile else None,
        buyer_phone=buyer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price=listing.asking_price_per_tonne,
        district=listing.district,
        state=listing.state,
        message=interest.message,
        status=interest.status.value,
        created_at=interest.created_at
    )

@app.get("/api/interests/my", response_model=List[BuyerInterestResponse], tags=["Marketplace"])
def get_my_buyer_interests(
    buyer: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    interests = db.query(BuyerInterest).filter(BuyerInterest.buyer_id == buyer.id).order_by(BuyerInterest.created_at.desc()).all()
    return [
        BuyerInterestResponse(
            id=i.id,
            listing_id=i.listing.id,
            buyer_id=buyer.id,
            buyer_name=buyer.full_name,
            buyer_business=buyer.buyer_profile.business_name if buyer.buyer_profile else None,
            buyer_phone=buyer.phone,
            quantity_tonnes=i.listing.quantity_tonnes,
            asking_price=i.listing.asking_price_per_tonne,
            district=i.listing.district,
            state=i.listing.state,
            message=i.message,
            status=i.status.value,
            created_at=i.created_at
        )
        for i in interests
    ]

# ==============================================================================
# 5. ML & BUYER MATCHING (PRESERVED & UNCHANGED)
# ==============================================================================
@app.post("/api/stubble/predict", response_model=StubblePredictionResponse, tags=["Stubble Estimation"])
def predict_stubble(request: StubblePredictionRequest):
    """Predicts harvestable paddy stubble (in metric tonnes) from farmer parcel information."""
    try:
        service = StubbleService()
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
def predict_burning_risk(request: BurningRiskRequest):
    """Predicts the probability of stubble burning occurrence P(fire=1) and maps to operational risk tiers."""
    try:
        service = BurningRiskService()
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

@app.post("/api/buyers/match", response_model=BuyerMatchResponse, tags=["Buyer Matching"])
def match_buyers(request: BuyerMatchRequest, db: Session = Depends(get_db)):
    """Ranks available biomass buyers using transparent multi-criteria scoring."""
    try:
        service = BuyerMatchingService()
        custom_buyers_dicts = [b.dict() for b in request.buyers] if request.buyers else None

        # If no custom buyers provided, optionally augment demo buyers with registered buyer profiles from DB
        if not custom_buyers_dicts:
            db_buyers = db.query(BuyerProfile).join(User, BuyerProfile.user_id == User.id).all()
            if db_buyers:
                augmented = list(service.demo_buyers)
                for bp in db_buyers:
                    augmented.append({
                        "buyer_id": f"BUYER-REG-{bp.user_id}",
                        "buyer_name": bp.business_name,
                        "latitude": bp.latitude or 30.9000,
                        "longitude": bp.longitude or 75.8573,
                        "offered_price": 2100.0,
                        "capacity_tonnes": 400.0,
                        "is_available": True,
                        "contact_number": bp.phone or bp.user.phone,
                        "district": bp.district,
                        "state": bp.state
                    })
                custom_buyers_dicts = augmented

        result = service.match_buyers(
            stubble_quantity=request.stubble_quantity,
            farmer_latitude=request.farmer_latitude,
            farmer_longitude=request.farmer_longitude,
            max_distance_km=request.max_distance_km or 120.0,
            custom_buyers=custom_buyers_dicts
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
def get_demo_buyers(db: Session = Depends(get_db)):
    """Returns the active biomass buyers registered in directory."""
    service = BuyerMatchingService()
    return service.demo_buyers

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
