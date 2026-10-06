from pydantic import BaseModel, Field
from typing import Optional, Dict

class BurningRiskRequest(BaseModel):
    latitude: float = Field(..., ge=20.0, le=38.0, description="Latitude of the farm/block")
    longitude: float = Field(..., ge=70.0, le=85.0, description="Longitude of the farm/block")
    date: Optional[str] = Field(default=None, description="Prediction date in YYYY-MM-DD format (defaults to peak season date)")
    lag_fire_days_past_3d: Optional[int] = Field(
        default=None,
        ge=0,
        description="Observed fire days in past 3 days (t-3 to t-1). Retrieved from real satellite database if omitted."
    )
    lag_fire_days_past_7d: Optional[int] = Field(
        default=None,
        ge=0,
        description="Observed fire days in past 7 days (t-7 to t-1). Retrieved from real satellite database if omitted."
    )
    prior_cumulative_fires: Optional[int] = Field(
        default=None,
        ge=0,
        description="Cumulative burning days up to t-1. Retrieved from real satellite database if omitted."
    )

class BurningRiskResponse(BaseModel):
    burning_probability: float = Field(..., description="Predicted probability of fire event P(fire=1)")
    risk_level: str = Field(..., description="Operational presentation tier: LOW, MEDIUM, or HIGH")
    latitude: float
    longitude: float
    grid_lat: float
    grid_lon: float
    date_analyzed: str
    day_of_harvest_season: int
    is_peak_harvest_window: bool
    lag_fire_days_past_3d: int
    lag_fire_days_past_7d: int
    prior_cumulative_fires: int
    lag_data_source: str
    thresholds: Dict[str, str] = {
        "LOW": "probability < 0.33",
        "MEDIUM": "0.33 <= probability <= 0.66",
        "HIGH": "probability > 0.66"
    }
    presentation_note: str = (
        "Risk categories are operational presentation tiers based on decision thresholds, "
        "not calibrated scientific absolutes."
    )
