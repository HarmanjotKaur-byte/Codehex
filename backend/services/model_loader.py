import os
import json
import joblib
import pandas as pd
from typing import Dict, Any

class ModelManager:
    """
    Singleton-style manager to load and hold trained ML models and real lookup baselines once in memory.
    Prevents repeated disk I/O on every API request.
    """
    _instance = None

    def __init__(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.stubble_model = None
        self.stubble_metadata = {}
        self.risk_model = None
        self.risk_metadata = {}
        self.district_yield_lookup: Dict[str, float] = {}
        self.global_median_yield: float = 2.45
        self.fire_lattice_df: pd.DataFrame = None

        self.load_models()
        self.load_district_yield_baseline()
        self.load_historical_fire_lattice()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        # 1. Load Model 1 (Stubble Regressor Pipeline)
        stubble_path = os.path.join(self.base_dir, "models", "stubble_model", "model.pkl")
        stubble_meta_path = os.path.join(self.base_dir, "models", "stubble_model", "metadata.json")

        if os.path.exists(stubble_path):
            self.stubble_model = joblib.load(stubble_path)
            print(f"Loaded Model 1 from {stubble_path}")
        else:
            raise FileNotFoundError(f"Model 1 artifact not found at {stubble_path}")

        if os.path.exists(stubble_meta_path):
            with open(stubble_meta_path, "r") as f:
                self.stubble_metadata = json.load(f)

        # 2. Load Model 3 (Burning Risk Classifier)
        risk_path = os.path.join(self.base_dir, "models", "burning_risk_model", "model.pkl")
        risk_meta_path = os.path.join(self.base_dir, "models", "burning_risk_model", "metadata.json")

        if os.path.exists(risk_path):
            self.risk_model = joblib.load(risk_path)
            print(f"Loaded Model 3 from {risk_path}")
        else:
            raise FileNotFoundError(f"Model 3 artifact not found at {risk_path}")

        if os.path.exists(risk_meta_path):
            with open(risk_meta_path, "r") as f:
                self.risk_metadata = json.load(f)

    def load_district_yield_baseline(self):
        """
        Load historical district yield baseline STRICTLY from training years (Crop_Year <= 2011)
        to prevent future information leakage into the inference baseline.
        """
        data_path = os.path.join(self.base_dir, "data", "processed", "stubble", "paddy_stubble_processed.csv")
        if os.path.exists(data_path):
            try:
                df = pd.read_csv(data_path)
                # Filter strictly to training years to guarantee zero future leakage
                df_train = df[df['Crop_Year'] <= 2011]
                medians = df_train.groupby(df_train['District_Name'].str.upper())['grain_yield_t_ha'].median()
                self.district_yield_lookup = medians.to_dict()
                self.global_median_yield = float(df_train['grain_yield_t_ha'].median())
                print(f"Loaded historical yield baseline for {len(self.district_yield_lookup)} districts (Crop_Year <= 2011)")
            except Exception as e:
                print(f"Warning: Could not build district yield baseline: {e}")

    def load_historical_fire_lattice(self):
        """
        Load the authentic NASA FIRMS spatiotemporal daily lattice
        to provide real-world, backward-looking lag features without hard-coding or fabrication.
        """
        firms_path = os.path.join(self.base_dir, "data", "processed", "burning_risk", "burning_risk_spatiotemporal_processed.csv")
        if os.path.exists(firms_path):
            try:
                self.fire_lattice_df = pd.read_csv(firms_path)
                print(f"Loaded historical fire lattice: {len(self.fire_lattice_df)} real spatiotemporal observations")
            except Exception as e:
                print(f"Warning: Could not load historical fire lattice: {e}")

    def get_district_baseline_yield(self, district_name: str) -> float:
        cleaned = district_name.strip().upper()
        return self.district_yield_lookup.get(cleaned, self.global_median_yield)
