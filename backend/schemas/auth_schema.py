from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from models import UserRole, VerificationStatus, ListingStatus, InterestStatus

# ==============================================================================
# AUTH & USER SCHEMAS
# ==============================================================================

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=50)
    password: str = Field(..., min_length=8)
    role: str = Field(..., description="Allowed registration roles: FARMER, BUYER, GOVERNMENT")

    # Farmer specific fields
    state: Optional[str] = "Punjab"
    district: Optional[str] = "Ludhiana"
    village: Optional[str] = None
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    village_id: Optional[str] = None
    latitude: Optional[float] = 30.9000
    longitude: Optional[float] = 75.8573

    # Buyer specific fields
    business_name: Optional[str] = None
    buyer_type: Optional[str] = "Biomass Aggregator"
    preferred_material: Optional[str] = "Paddy Straw Bales"

    # Government specific fields
    department: Optional[str] = None
    designation: Optional[str] = None
    employee_id: Optional[str] = None
    official_email: Optional[EmailStr] = None
    verification_document: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    verification_status: Optional[str] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ==============================================================================
# VERIFICATION & ADMIN SCHEMAS
# ==============================================================================

class GovernmentVerificationItem(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str]
    department: str
    designation: str
    state: str
    district: str
    employee_id: str
    official_email: Optional[str]
    verification_document: Optional[str]
    verification_status: str
    submitted_date: datetime
    verified_at: Optional[datetime]
    rejection_reason: Optional[str]

class GovernmentApprovalRequest(BaseModel):
    pass

class GovernmentRejectionRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=5, description="Reason for verification rejection")

class SuperAdminStatsResponse(BaseModel):
    total_users: int
    total_farmers: int
    total_buyers: int
    total_government: int
    pending_verifications: int
    verified_government: int
    rejected_government: int
    total_listings: int
    total_interests: int

# ==============================================================================
# MARKETPLACE LISTING & INTEREST SCHEMAS
# ==============================================================================

class StubbleListingCreate(BaseModel):
    quantity_tonnes: float = Field(..., gt=0)
    asking_price_per_tonne: float = Field(..., gt=0)
    latitude: float = Field(..., ge=20.0, le=38.0)
    longitude: float = Field(..., ge=70.0, le=85.0)
    district: Optional[str] = "Ludhiana"
    state: Optional[str] = "Punjab"
    village: Optional[str] = None
    crop: Optional[str] = None
    residue_type: Optional[str] = None
    condition: Optional[str] = None
    harvest_date: Optional[str] = None
    available_until: Optional[datetime] = None

class StubbleListingUpdate(BaseModel):
    quantity_tonnes: Optional[float] = Field(default=None, gt=0)
    asking_price_per_tonne: Optional[float] = Field(default=None, gt=0)
    village: Optional[str] = None
    crop: Optional[str] = None
    residue_type: Optional[str] = None
    condition: Optional[str] = None
    harvest_date: Optional[str] = None
    status: Optional[str] = None

class StubbleListingResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: Optional[str] = None
    quantity_tonnes: float
    asking_price_per_tonne: float
    latitude: float
    longitude: float
    district: Optional[str]
    state: Optional[str]
    village: Optional[str] = None
    crop: Optional[str] = None
    residue_type: Optional[str] = None
    condition: Optional[str] = None
    harvest_date: Optional[str] = None
    status: str
    created_at: datetime
    interest_count: int = 0

class BuyerInterestCreate(BaseModel):
    listing_id: int
    message: Optional[str] = None

class BuyerInterestResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    buyer_name: str
    buyer_business: Optional[str]
    buyer_phone: Optional[str]
    # Farmer info (for buyer's activity view)
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    farmer_email: Optional[str] = None
    crop: Optional[str] = None
    residue_type: Optional[str] = None
    village: Optional[str] = None
    quantity_tonnes: float
    asking_price: float
    district: Optional[str]
    state: Optional[str]
    message: Optional[str]
    status: str
    created_at: datetime

# Farmer sees who expressed interest in their listing
class ListingInterestView(BaseModel):
    interest_id: int
    listing_id: int
    buyer_id: int
    buyer_name: str
    buyer_business: Optional[str]
    buyer_phone: Optional[str]
    message: Optional[str]
    status: str
    interest_date: datetime
    listing_qty: float
    listing_price: float
    listing_district: Optional[str]

# Farmer contacts a buyer (on-site message)
class ContactRequestCreate(BaseModel):
    buyer_id: Optional[Any] = None
    message: str = ""
    buyer_name_ref: Optional[str] = None
    stubble_qty: Optional[float] = None
    listing_id: Optional[int] = None

class ContactRequestResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: Optional[str] = None
    farmer_email: Optional[str] = None
    farmer_location: Optional[str] = None
    buyer_id: Optional[int] = None
    buyer_name_ref: Optional[str] = None
    message: str
    stubble_qty: Optional[float] = None
    listing_id: Optional[int] = None
    crop: Optional[str] = "Paddy Straw"
    residue_type: Optional[str] = "Baled Straw"
    price: Optional[float] = None
    district: Optional[str] = None
    state: Optional[str] = None
    status: str = "INTERESTED"
    is_read: bool = False
    created_at: datetime


# Buyer Permanent Registration / Verification Schemas
class BuyerRegisterInterestRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    business_name: str
    buyer_type: str = "Biomass Aggregator"
    preferred_material: str = "Paddy Straw Bales"
    required_quantity_tonnes: float = 100.0
    state: str = "Punjab"
    district: str = "Ludhiana"
    location_address: Optional[str] = None
    max_distance_km: float = 100.0
    budget_per_tonne: float = 2000.0
    purchase_frequency: str = "Regular / Seasonal"
    additional_requirements: Optional[str] = None
    document_type: Optional[str] = "GSTIN Certificate"
    document_id_number: Optional[str] = None
    document_url: Optional[str] = None

class BuyerRegisterInterestResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    business_name: str
    buyer_type: str
    preferred_material: str
    required_quantity_tonnes: float
    state: str
    district: str
    location_address: Optional[str] = None
    max_distance_km: float
    budget_per_tonne: float
    purchase_frequency: str
    additional_requirements: Optional[str] = None
    verification_status: str
    is_certified: bool
    document_type: Optional[str] = None
    document_id_number: Optional[str] = None
    document_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
