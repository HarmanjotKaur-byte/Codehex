import os
import pandas as pd
from typing import Dict, Any, List

class BurningStatisticsService:
    def __init__(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.firms_path = os.path.join(self.base_dir, "data", "processed", "burning_risk", "burning_risk_spatiotemporal_processed.csv")
        self.df = None
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.firms_path):
            try:
                self.df = pd.read_csv(self.firms_path)
                self.df['acq_date'] = pd.to_datetime(self.df['acq_date'])
                self.df['year'] = self.df['acq_date'].dt.year
                self.df['month'] = self.df['acq_date'].dt.month
            except Exception as e:
                print(f"Failed to load FIRMS data for statistics: {e}")
                self.df = pd.DataFrame()
        else:
            self.df = pd.DataFrame()

    def get_annual_statistics(self) -> List[Dict[str, Any]]:
        if self.df.empty:
            return []
        
        # Group by year
        annual = self.df.groupby('year')['fire_count'].sum().reset_index()
        
        results = []
        for _, row in annual.iterrows():
            year = int(row['year'])
            total = int(row['fire_count'])
            # Rough attribution based on latitude (just illustrative for the hackathon context)
            # Punjab mostly > 29.5 N, Haryana mostly < 29.5 N
            df_year = self.df[self.df['year'] == year]
            punjab = int(df_year[df_year['grid_lat'] > 29.5]['fire_count'].sum())
            haryana = int(df_year[df_year['grid_lat'] <= 29.5]['fire_count'].sum())
            
            results.append({
                "year": year,
                "total_detections": total,
                "punjab_detections": punjab,
                "haryana_detections": haryana
            })
        return results

    def get_monthly_statistics(self, year: int) -> List[Dict[str, Any]]:
        if self.df.empty:
            return []
        
        df_year = self.df[self.df['year'] == year]
        if df_year.empty:
            return []
            
        monthly = df_year.groupby('month')['fire_count'].sum().reset_index()
        results = []
        for _, row in monthly.iterrows():
            results.append({
                "month": int(row['month']),
                "total_detections": int(row['fire_count'])
            })
        return results
        
    def get_daily_statistics(self, year: int) -> List[Dict[str, Any]]:
        if self.df.empty:
            return []
        
        df_year = self.df[self.df['year'] == year]
        if df_year.empty:
            return []
            
        daily = df_year.groupby('acq_date')['fire_count'].sum().reset_index()
        results = []
        for _, row in daily.iterrows():
            results.append({
                "date": row['acq_date'].strftime("%Y-%m-%d"),
                "total_detections": int(row['fire_count'])
            })
        # sort
        results.sort(key=lambda x: x['date'])
        return results
