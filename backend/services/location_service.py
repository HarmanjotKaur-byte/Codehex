import json
import os

# We will generate a structured dictionary of states and districts.
# For villages, we will generate them dynamically or use a predefined list for demo districts to simulate a large database.

STATES = [
    {"id": "PB", "name": "Punjab", "priority": 1},
    {"id": "HR", "name": "Haryana", "priority": 2},
    {"id": "RJ", "name": "Rajasthan", "priority": 3},
    {"id": "AP", "name": "Andhra Pradesh", "priority": 4},
    {"id": "AR", "name": "Arunachal Pradesh", "priority": 4},
    {"id": "AS", "name": "Assam", "priority": 4},
    {"id": "BR", "name": "Bihar", "priority": 4},
    {"id": "CH", "name": "Chandigarh", "priority": 4},
    {"id": "CT", "name": "Chhattisgarh", "priority": 4},
    {"id": "DL", "name": "Delhi", "priority": 4},
    {"id": "GA", "name": "Goa", "priority": 4},
    {"id": "GJ", "name": "Gujarat", "priority": 4},
    {"id": "HP", "name": "Himachal Pradesh", "priority": 4},
    {"id": "JK", "name": "Jammu & Kashmir", "priority": 4},
    {"id": "JH", "name": "Jharkhand", "priority": 4},
    {"id": "KA", "name": "Karnataka", "priority": 4},
    {"id": "KL", "name": "Kerala", "priority": 4},
    {"id": "LA", "name": "Ladakh", "priority": 4},
    {"id": "MP", "name": "Madhya Pradesh", "priority": 4},
    {"id": "MH", "name": "Maharashtra", "priority": 4},
    {"id": "MN", "name": "Manipur", "priority": 4},
    {"id": "ML", "name": "Meghalaya", "priority": 4},
    {"id": "MZ", "name": "Mizoram", "priority": 4},
    {"id": "NL", "name": "Nagaland", "priority": 4},
    {"id": "OR", "name": "Odisha", "priority": 4},
    {"id": "PY", "name": "Puducherry", "priority": 4},
    {"id": "SK", "name": "Sikkim", "priority": 4},
    {"id": "TN", "name": "Tamil Nadu", "priority": 4},
    {"id": "TG", "name": "Telangana", "priority": 4},
    {"id": "TR", "name": "Tripura", "priority": 4},
    {"id": "UP", "name": "Uttar Pradesh", "priority": 4},
    {"id": "UK", "name": "Uttarakhand", "priority": 4},
    {"id": "WB", "name": "West Bengal", "priority": 4}
]

DISTRICTS = {
    "PB": [
        "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
        "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", 
        "Malerkotla", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", 
        "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"
    ],
    "HR": [
        "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", 
        "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", 
        "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", 
        "Sonipat", "Yamunanagar"
    ],
    "RJ": [
        "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", 
        "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", 
        "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", 
        "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", 
        "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
    ]
}

def get_states():
    # Sort by priority, then alphabetically
    return sorted(STATES, key=lambda x: (x["priority"], x["name"]))

def get_districts(state_id: str):
    districts = DISTRICTS.get(state_id, [f"District 1 of {state_id}", f"District 2 of {state_id}"])
    return [{"id": f"{state_id}-{d.replace(' ', '_').upper()}", "name": d, "state_id": state_id} for d in sorted(districts)]

def get_villages(district_id: str, query: str = None):
    # To simulate thousands of villages and fast search, we will generate a deterministic list of villages for a district
    # based on the district name.
    
    parts = district_id.split("-")
    district_name = parts[-1].capitalize() if len(parts) > 1 else "Unknown"
    
    # Common Indian village suffixes
    suffixes = ["Kalan", "Khurd", "Pur", "Nagar", "Wala", "Garh", "Pind", "Vihar", "Majra", "Kot"]
    prefixes = ["Ram", "Sham", "Naveen", "Fateh", "Guru", "Lal", "Kishan", "Bagh", "Taj", "Sher"]
    
    villages = []
    
    # Generate ~200 deterministic villages for the given district
    for p in prefixes:
        for s in suffixes:
            villages.append(f"{p} {s}")
            villages.append(f"{p}{s}")
    
    # Add some specific ones for Ludhiana to match the prompt's example if needed
    if "LDH" in district_id or "LUDHIANA" in district_id:
        villages.extend(["Khamano", "Khanna", "Khatra", "Khedi", "Khasi Kalan"])
        
    villages = sorted(list(set(villages)))
    
    result = [{"id": f"{district_id}-V{i}", "name": v, "district_id": district_id} for i, v in enumerate(villages)]
    
    if query:
        q = query.lower()
        result = [v for v in result if q in v["name"].lower()]
        
    return result
