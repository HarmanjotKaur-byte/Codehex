from pydantic import BaseModel, Field
from typing import List, Optional

class BuyerInfo(BaseModel):
    buyer_id: str
    buyer_name: str
    latitude: float
    longitude: float
    offered_price: float = Field(..., gt=0, description="Price offered in INR (₹) per tonne")
    capacity_tonnes: float = Field(..., gt=0, description="Daily or batch intake capacity in tonnes")
    is_available: bool = Field(default=True, description="Whether buyer is actively accepting deliveries")
    contact_number: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class BuyerMatchRequest(BaseModel):
    stubble_quantity: float = Field(..., gt=0, description="Available stubble quantity in metric tonnes")
    farmer_latitude: float = Field(..., ge=20.0, le=38.0, description="Farmer parcel latitude")
    farmer_longitude: float = Field(..., ge=70.0, le=85.0, description="Farmer parcel longitude")
    max_distance_km: Optional[float] = Field(default=120.0, gt=0, description="Maximum logistics radius in km")
    buyers: Optional[List[BuyerInfo]] = Field(
        default=None,
        description="Optional list of buyers to score. If omitted, uses default demo marketplace buyers."
    )

class BuyerMatchItem(BaseModel):
    buyer_id: str
    buyer_name: str
    distance_km: float
    offered_price: float
    capacity_tonnes: float
    capacity_covered: bool
    is_available: bool
    contact_number: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    distance_score: float
    price_score: float
    capacity_score: float
    availability_score: float
    suitability_score: float = Field(..., description="Overall Smart Buyer Suitability Score (0.0 to 1.0)")

class BuyerMatchResponse(BaseModel):
    algorithm_type: str = "Multi-Criteria Weighted Scoring (Transparent Non-ML)"
    farmer_stubble_tonnes: float
    search_radius_km: float
    total_buyers_evaluated: int
    matched_buyers_count: int
    matches: List[BuyerMatchItem]
    scoring_weights: dict = {
        "distance_weight": 0.35,
        "price_weight": 0.35,
        "capacity_weight": 0.20,
        "availability_weight": 0.10
    }
