from pydantic import BaseModel, Field
from typing import Optional

class StubblePredictionRequest(BaseModel):
    Area: float = Field(..., gt=0, description="Cultivated land parcel area in hectares")
    State_Name: str = Field(default="Punjab", description="State name, e.g. Punjab, Haryana")
    District_Name: str = Field(..., description="District name, e.g. Ludhiana, Patiala, Karnal")
    Crop_Year: Optional[int] = Field(default=2024, description="Harvest year")
    Season: Optional[str] = Field(default="Kharif", description="Crop season, defaults to Kharif")
    district_hist_yield: Optional[float] = Field(
        default=None,
        gt=0,
        description="Optional historical median grain yield (t/ha). Looked up automatically if omitted."
    )

class StubblePredictionResponse(BaseModel):
    predicted_stubble_tonnes: float = Field(..., description="Predicted harvestable/recoverable stubble in metric tonnes")
    predicted_gross_straw_tonnes: float = Field(..., description="Estimated total aboveground straw before baling loss")
    area_hectares: float
    state_used: str
    district_used: str
    district_baseline_yield_t_ha: float
    model_version: str = "RandomForestRegressor_v1.0"
