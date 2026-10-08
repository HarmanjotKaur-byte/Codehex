import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\backend\schemas\auth_schema.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Patch StubbleListingCreate
old_create = """class StubbleListingCreate(BaseModel):
    quantity_tonnes: float = Field(..., gt=0)
    asking_price_per_tonne: float = Field(..., gt=0)
    latitude: float = Field(..., ge=20.0, le=38.0)
    longitude: float = Field(..., ge=70.0, le=85.0)
    district: Optional[str] = "Ludhiana"
    state: Optional[str] = "Punjab"
    available_until: Optional[datetime] = None"""

new_create = """class StubbleListingCreate(BaseModel):
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
    available_until: Optional[datetime] = None"""
content = content.replace(old_create, new_create)

# Patch StubbleListingUpdate
old_update = """class StubbleListingUpdate(BaseModel):
    quantity_tonnes: Optional[float] = Field(default=None, gt=0)
    asking_price_per_tonne: Optional[float] = Field(default=None, gt=0)
    status: Optional[str] = None"""

new_update = """class StubbleListingUpdate(BaseModel):
    quantity_tonnes: Optional[float] = Field(default=None, gt=0)
    asking_price_per_tonne: Optional[float] = Field(default=None, gt=0)
    village: Optional[str] = None
    crop: Optional[str] = None
    residue_type: Optional[str] = None
    condition: Optional[str] = None
    harvest_date: Optional[str] = None
    status: Optional[str] = None"""
content = content.replace(old_update, new_update)

# Patch StubbleListingResponse
old_response = """class StubbleListingResponse(BaseModel):
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
    interest_count: int = 0"""

new_response = """class StubbleListingResponse(BaseModel):
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
    interest_count: int = 0"""
content = content.replace(old_response, new_response)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("auth_schema.py patched.")
