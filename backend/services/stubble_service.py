import pandas as pd
from typing import Dict, Any
from .model_loader import ModelManager

class StubbleService:
    def __init__(self):
        self.manager = ModelManager.get_instance()

    def predict_stubble(
        self,
        area: float,
        state_name: str,
        district_name: str,
        crop_year: int = 2024,
        season: str = "Kharif",
        district_hist_yield: float = None
    ) -> Dict[str, Any]:
        """
        Predict available stubble quantity using the trained RandomForestRegressor pipeline.
        Features: ['Area', 'State_Name', 'District_Name', 'Crop_Year', 'Season', 'district_hist_yield']
        """
        if area <= 0:
            raise ValueError("Area must be a positive number greater than 0.")

        # Determine district baseline yield if not supplied by caller
        if district_hist_yield is None or district_hist_yield <= 0:
            district_hist_yield = self.manager.get_district_baseline_yield(district_name)

        # Standardize strings to match training vocabulary
        cleaned_district = district_name.strip().upper()
        cleaned_state = state_name.strip().title()
        cleaned_season = season.strip().title()

        model = self.manager.stubble_model

        # The model was trained on district-scale statistics where Area was typically >= 100 ha.
        # For farm-level parcels (< 100 ha), decision trees cannot extrapolate below their training minimum
        # and would return the leaf minimum (~1,000 tonnes).
        # We query the model's learned district stubble density (t/ha) at a reference scale (1,000 ha)
        # and scale proportionally by the farmer's exact parcel area.
        if area < 100.0:
            ref_area = 1000.0
            row_ref = pd.DataFrame([{
                'Area': ref_area,
                'State_Name': cleaned_state,
                'District_Name': cleaned_district,
                'Crop_Year': crop_year,
                'Season': cleaned_season,
                'district_hist_yield': district_hist_yield
            }])
            pred_ref = float(model.predict(row_ref)[0])
            stubble_rate_per_ha = pred_ref / ref_area
            predicted_stubble = round(stubble_rate_per_ha * area, 2)
            predicted_gross_straw = round(predicted_stubble * (1.40 / (1.40 * 0.80)), 2) # gross = recoverable / 0.80
        else:
            row = pd.DataFrame([{
                'Area': area,
                'State_Name': cleaned_state,
                'District_Name': cleaned_district,
                'Crop_Year': crop_year,
                'Season': cleaned_season,
                'district_hist_yield': district_hist_yield
            }])
            predicted_stubble = round(float(model.predict(row)[0]), 2)
            predicted_gross_straw = round(predicted_stubble / 0.80, 2)

        return {
            "predicted_stubble_tonnes": predicted_stubble,
            "predicted_gross_straw_tonnes": predicted_gross_straw,
            "area_hectares": area,
            "state_used": cleaned_state,
            "district_used": cleaned_district,
            "district_baseline_yield_t_ha": round(float(district_hist_yield), 3),
            "model_version": self.manager.stubble_metadata.get("model_type", "RandomForestRegressor")
        }
