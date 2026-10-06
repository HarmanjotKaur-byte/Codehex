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
    pass # No extra parameters required for approval

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
    available_until: Optional[datetime] = None

class StubbleListingUpdate(BaseModel):
    quantity_tonnes: Optional[float] = Field(default=None, gt=0)
    asking_price_per_tonne: Optional[float] = Field(default=None, gt=0)
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
    quantity_tonnes: float
    asking_price: float
    district: Optional[str]
    state: Optional[str]
    message: Optional[str]
    status: str
    created_at: datetime
