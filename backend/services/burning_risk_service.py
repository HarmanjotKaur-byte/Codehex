import math
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional
from .model_loader import ModelManager

class BurningRiskService:
    def __init__(self):
        self.manager = ModelManager.get_instance()

    def predict_risk(
        self,
        latitude: float,
        longitude: float,
        date_str: Optional[str] = None,
        lag_fire_days_past_3d: Optional[int] = None,
        lag_fire_days_past_7d: Optional[int] = None,
        prior_cumulative_fires: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Predict stubble burning risk using the trained RandomForestClassifier.
        Features: ['grid_lat', 'grid_lon', 'day_of_year', 'calendar_week',
                   'day_of_harvest_season', 'is_peak_harvest_window',
                   'lag_fire_days_past_3d', 'lag_fire_days_past_7d', 'prior_cumulative_fires']
        """
        # 1. Snap coordinates to the 0.25 deg agricultural grid used during training
        grid_step = 0.25
        lat_min, lon_min = 28.5, 73.5
        grid_lat = round(math.floor((latitude - lat_min) / grid_step) * grid_step + lat_min + grid_step / 2, 3)
        grid_lon = round(math.floor((longitude - lon_min) / grid_step) * grid_step + lon_min + grid_step / 2, 3)

        # 2. Parse date or default to an active harvest window date
        if date_str:
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Invalid date format. Expected YYYY-MM-DD.")
        else:
            now = datetime.now()
            if now.month in [10, 11]:
                dt = now
            else:
                dt = datetime(now.year, 10, 28)

        day_of_year = dt.timetuple().tm_yday
        calendar_week = int(dt.isocalendar()[1])

        # Day of harvest season relative to October 1 start
        oct_1 = datetime(dt.year, 10, 1)
        diff_days = (dt - oct_1).days + 1
        day_of_harvest_season = max(1, min(61, diff_days))

        # Peak window: October 20 to November 15 (Days 20 to 46 of harvest season)
        is_peak_window = 1 if (20 <= day_of_harvest_season <= 46) else 0

        # 3. Retrieve Real Lag Observations (Eliminating Arbitrary Defaults)
        lag_source = "User-supplied custom values"
        needs_auto_lag = (
            lag_fire_days_past_3d is None or
            lag_fire_days_past_7d is None or
            prior_cumulative_fires is None
        )

        if needs_auto_lag:
            lattice_df = self.manager.fire_lattice_df
            if lattice_df is not None and not lattice_df.empty:
                # Query real historical satellite observation table
                # Check exact match by date
                matched_row = lattice_df[
                    (lattice_df['grid_lat'] == grid_lat) &
                    (lattice_df['grid_lon'] == grid_lon) &
                    (lattice_df['acq_date'] == dt.strftime("%Y-%m-%d"))
                ]

                # If year differs or no exact date match, match by cell and day_of_harvest_season
                if matched_row.empty:
                    matched_row = lattice_df[
                        (lattice_df['grid_lat'] == grid_lat) &
                        (lattice_df['grid_lon'] == grid_lon) &
                        (lattice_df['day_of_harvest_season'] == day_of_harvest_season)
                    ]

                if not matched_row.empty:
                    record = matched_row.iloc[0]
                    if lag_fire_days_past_3d is None:
                        lag_fire_days_past_3d = int(record['lag_fire_days_past_3d'])
                    if lag_fire_days_past_7d is None:
                        lag_fire_days_past_7d = int(record['lag_fire_days_past_7d'])
                    if prior_cumulative_fires is None:
                        prior_cumulative_fires = int(record['prior_cumulative_fires'])
                    lag_source = f"NASA FIRMS VIIRS Historical Spatiotemporal Lattice (Real Cell {grid_lat}N, {grid_lon}E, Day {day_of_harvest_season})"
                else:
                    # Spatial cell outside the 156 monitored agricultural zones: query domain-wide median for this day of season
                    domain_day = lattice_df[lattice_df['day_of_harvest_season'] == day_of_harvest_season]
                    if not domain_day.empty:
                        if lag_fire_days_past_3d is None:
                            lag_fire_days_past_3d = int(round(domain_day['lag_fire_days_past_3d'].median()))
                        if lag_fire_days_past_7d is None:
                            lag_fire_days_past_7d = int(round(domain_day['lag_fire_days_past_7d'].median()))
                        if prior_cumulative_fires is None:
                            prior_cumulative_fires = int(round(domain_day['prior_cumulative_fires'].median()))
                        lag_source = f"NASA FIRMS Regional Median for Day {day_of_harvest_season} of Harvest Window"
                    else:
                        lag_fire_days_past_3d = lag_fire_days_past_3d or 0
                        lag_fire_days_past_7d = lag_fire_days_past_7d or 0
                        prior_cumulative_fires = prior_cumulative_fires or 0
                        lag_source = "Zero-baseline fallback (Out-of-domain)"
            else:
                lag_fire_days_past_3d = lag_fire_days_past_3d or 0
                lag_fire_days_past_7d = lag_fire_days_past_7d or 0
                prior_cumulative_fires = prior_cumulative_fires or 0
                lag_source = "Static fallback (Historical database not initialized)"

        # 4. Construct single-row feature DataFrame strictly matching training features
        features_df = pd.DataFrame([{
            'grid_lat': grid_lat,
            'grid_lon': grid_lon,
            'day_of_year': day_of_year,
            'calendar_week': calendar_week,
            'day_of_harvest_season': day_of_harvest_season,
            'is_peak_harvest_window': is_peak_window,
            'lag_fire_days_past_3d': int(lag_fire_days_past_3d),
            'lag_fire_days_past_7d': int(lag_fire_days_past_7d),
            'prior_cumulative_fires': int(prior_cumulative_fires)
        }])

        model = self.manager.risk_model
        probability = float(model.predict_proba(features_df)[0][1])

        # Operational presentation tiers:
        # LOW: < 0.33, MEDIUM: 0.33–0.66, HIGH: > 0.66
        if probability < 0.33:
            risk_level = "LOW"
        elif probability <= 0.66:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        return {
            "burning_probability": round(probability, 4),
            "risk_level": risk_level,
            "latitude": latitude,
            "longitude": longitude,
            "grid_lat": grid_lat,
            "grid_lon": grid_lon,
            "date_analyzed": dt.strftime("%Y-%m-%d"),
            "day_of_harvest_season": day_of_harvest_season,
            "is_peak_harvest_window": bool(is_peak_window),
            "lag_fire_days_past_3d": int(lag_fire_days_past_3d),
            "lag_fire_days_past_7d": int(lag_fire_days_past_7d),
            "prior_cumulative_fires": int(prior_cumulative_fires),
            "lag_data_source": lag_source
        }
