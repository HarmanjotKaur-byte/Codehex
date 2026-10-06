import os
import json
import math
from typing import List, Dict, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points
    on the Earth using the Haversine formula.
    """
    R = 6371.0 # Earth's radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

class BuyerMatchingService:
    def __init__(self):
        self.data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
        self.demo_buyers_path = os.path.join(self.data_dir, "demo_buyers.json")
        self.demo_buyers = self._load_demo_buyers()

    def _load_demo_buyers(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.demo_buyers_path):
            with open(self.demo_buyers_path, "r", encoding="utf-8") as f:
                buyers = json.load(f)
                return [b for b in buyers if "buyer_id" in b]
        return []

    def match_buyers(
        self,
        stubble_quantity: float,
        farmer_latitude: float,
        farmer_longitude: float,
        max_distance_km: float = 120.0,
        custom_buyers: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Transparent Multi-Criteria Scoring for Smart Buyer Matching.
        NOT an ML prediction. Evaluates distance, price, capacity, and availability.
        """
        if stubble_quantity <= 0:
            raise ValueError("Stubble quantity must be greater than 0.")

        candidates = custom_buyers if (custom_buyers and len(custom_buyers) > 0) else self.demo_buyers

        if not candidates:
            return {
                "algorithm_type": "Multi-Criteria Weighted Scoring (Transparent Non-ML)",
                "farmer_stubble_tonnes": stubble_quantity,
                "search_radius_km": max_distance_km,
                "total_buyers_evaluated": 0,
                "matched_buyers_count": 0,
                "matches": []
            }

        # Weights configuration
        W_DIST = 0.35
        W_PRICE = 0.35
        W_CAP = 0.20
        W_AVAIL = 0.10

        # Benchmark reference price for normalization (₹2,500/tonne ceiling)
        BENCHMARK_PRICE = 2500.0

        matches = []
        for b in candidates:
            buyer_id = b.get("buyer_id", "UNKNOWN")
            buyer_name = b.get("buyer_name", "Biomass Aggregator")
            b_lat = float(b["latitude"])
            b_lon = float(b["longitude"])
            offered_price = float(b.get("offered_price", 1800.0))
            capacity = float(b.get("capacity_tonnes", 100.0))
            is_avail = bool(b.get("is_available", True))

            # 1. Haversine Distance
            dist_km = haversine_distance(farmer_latitude, farmer_longitude, b_lat, b_lon)

            # Skip buyers exceeding maximum search radius
            if dist_km > max_distance_km:
                continue

            # 2. Normalized Distance Score (Linear decay from 1.0 at 0km to 0.0 at max_dist)
            distance_score = max(0.0, 1.0 - (dist_km / max_distance_km))

            # 3. Normalized Price Score (Economic incentive for farmer)
            price_score = min(1.0, max(0.0, offered_price / BENCHMARK_PRICE))

            # 4. Normalized Capacity Score (Checks if buyer can absorb stubble)
            capacity_ratio = capacity / stubble_quantity
            capacity_score = min(1.0, capacity_ratio) if capacity_ratio > 0 else 0.0
            capacity_covered = capacity >= stubble_quantity

            # 5. Availability Score
            availability_score = 1.0 if is_avail else 0.0

            # 6. Composite Suitability Score
            suitability = (
                W_DIST * distance_score +
                W_PRICE * price_score +
                W_CAP * capacity_score +
                W_AVAIL * availability_score
            )

            matches.append({
                "buyer_id": buyer_id,
                "buyer_name": buyer_name,
                "distance_km": dist_km,
                "offered_price": offered_price,
                "capacity_tonnes": capacity,
                "capacity_covered": capacity_covered,
                "is_available": is_avail,
                "contact_number": b.get("contact_number"),
                "district": b.get("district"),
                "state": b.get("state"),
                "distance_score": round(distance_score, 4),
                "price_score": round(price_score, 4),
                "capacity_score": round(capacity_score, 4),
                "availability_score": round(availability_score, 4),
                "suitability_score": round(suitability, 4)
            })

        # Rank buyers by descending suitability score
        matches.sort(key=lambda x: x["suitability_score"], reverse=True)

        return {
            "algorithm_type": "Multi-Criteria Weighted Scoring (Transparent Non-ML)",
            "farmer_stubble_tonnes": stubble_quantity,
            "search_radius_km": max_distance_km,
            "total_buyers_evaluated": len(candidates),
            "matched_buyers_count": len(matches),
            "matches": matches,
            "scoring_weights": {
                "distance_weight": W_DIST,
                "price_weight": W_PRICE,
                "capacity_weight": W_CAP,
                "availability_weight": W_AVAIL
            }
        }
