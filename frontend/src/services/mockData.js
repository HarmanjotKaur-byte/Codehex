// ParaliPay Resilient Mock & Demo Dataset
// Used for standalone frontend hosting (e.g., Vercel, Netlify) when the backend is offline or unlinked

export const MOCK_FARMER_USER = {
  id: 1,
  full_name: "Harmanpreet Singh Brar",
  email: "e2e_farmer@punjab.in",
  phone: "+91 98150 24680",
  role: "FARMER",
  farmer_profile: {
    state: "Punjab",
    district: "Ludhiana",
    village: "Jagraon",
    latitude: 30.7850,
    longitude: 75.4780
  }
};

export const MOCK_BUYER_USER = {
  id: 2,
  full_name: "Vikramaditya Singhania",
  email: "e2e_buyer@biomassenergy.com",
  phone: "+91 98765 11223",
  role: "BUYER",
  buyer_profile: {
    business_name: "EverGreen Bio-Energy & CBG Plant Ltd",
    buyer_type: "Bio-CNG / CBG Plant",
    state: "Punjab",
    district: "Ludhiana",
    latitude: 30.9010,
    longitude: 75.8573,
    phone: "+91 98765 11223",
    preferred_material: "Paddy Straw Bales",
    required_quantity_tonnes: 6500.0,
    budget_per_tonne: 2350.0,
    verification_status: "VERIFIED",
    is_certified: true
  }
};

export const MOCK_MY_LISTINGS = [
  {
    id: 1,
    farmer_id: 1,
    farmer_name: "Harmanpreet Singh Brar",
    farmer_phone: "+91 98150 24680",
    quantity_tonnes: 380.0,
    asking_price_per_tonne: 2150.0,
    latitude: 30.7850,
    longitude: 75.4780,
    state: "Punjab",
    district: "Ludhiana",
    village: "Jagraon",
    crop: "Paddy (Rice)",
    residue_type: "Baled Straw",
    condition: "Dry",
    harvest_date: "2026-09-28",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    interest_count: 1
  }
];

export const MOCK_MY_INTERESTS = [
  {
    id: 1,
    listing_id: 1,
    buyer_id: 2,
    buyer_name: "Vikramaditya Singhania",
    buyer_business_name: "EverGreen Bio-Energy & CBG Plant Ltd",
    buyer_phone: "+91 98765 11223",
    crop: "Paddy (Rice)",
    quantity_tonnes: 380.0,
    message: "We have reviewed your 380 tonnes lot in Jagraon. We can deploy 4 semi-trailers starting this Monday. Gate price offered at ₹2,150/tonne.",
    status: "ACCEPTED",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const MOCK_MY_CONTACTS = [
  {
    id: 1,
    farmer_id: 1,
    buyer_id: 2,
    buyer_name_ref: "EverGreen Bio-Energy & CBG Plant Ltd",
    message: "Sat Sri Akal Vikramaditya ji. We have 380 tonnes of dry, clean rectangular bales ready at our Jagraon farm. Full truck access available.",
    stubble_qty: 380.0,
    status: "ACCEPTED",
    is_read: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const MOCK_ALL_LISTINGS = [
  {
    id: 1,
    farmer_id: 1,
    farmer_name: "Harmanpreet Singh Brar",
    farmer_phone: "+91 98150 24680",
    quantity_tonnes: 380.0,
    asking_price_per_tonne: 2150.0,
    latitude: 30.7850,
    longitude: 75.4780,
    state: "Punjab",
    district: "Ludhiana",
    village: "Jagraon",
    crop: "Paddy (Rice)",
    residue_type: "Baled Straw",
    condition: "Dry",
    harvest_date: "2026-09-28",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 2,
    farmer_id: 3,
    farmer_name: "Balwinder Singh Sidhu",
    farmer_phone: "+91 98142 33411",
    quantity_tonnes: 210.0,
    asking_price_per_tonne: 1850.0,
    latitude: 29.9880,
    longitude: 75.0860,
    state: "Punjab",
    district: "Bathinda",
    village: "Talwandi Sabo",
    crop: "Cotton",
    residue_type: "Cotton Stalks",
    condition: "Dry",
    harvest_date: "2026-10-02",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 3,
    farmer_id: 4,
    farmer_name: "Gurdeep Singh Gill",
    farmer_phone: "+91 98720 44522",
    quantity_tonnes: 540.0,
    asking_price_per_tonne: 1900.0,
    latitude: 30.1280,
    longitude: 75.7990,
    state: "Punjab",
    district: "Sangrur",
    village: "Sunam",
    crop: "Paddy (Rice)",
    residue_type: "Loose Straw",
    condition: "Semi-Dry",
    harvest_date: "2026-10-05",
    status: "RESERVED",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 4,
    farmer_id: 5,
    farmer_name: "Rajinder Kumar Sharma",
    farmer_phone: "+91 94161 22377",
    quantity_tonnes: 480.0,
    asking_price_per_tonne: 2350.0,
    latitude: 29.8330,
    longitude: 76.9200,
    state: "Haryana",
    district: "Karnal",
    village: "Nilokheri",
    crop: "Paddy (Rice)",
    residue_type: "Baled Straw",
    condition: "Dry",
    harvest_date: "2026-10-03",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 5,
    farmer_id: 6,
    farmer_name: "Mahendra Pratap Shekhawat",
    farmer_phone: "+91 94140 11244",
    quantity_tonnes: 650.0,
    asking_price_per_tonne: 1550.0,
    latitude: 29.9200,
    longitude: 74.0500,
    state: "Rajasthan",
    district: "Sri Ganganagar",
    village: "Sadulshahar",
    crop: "Mustard",
    residue_type: "Mustard Husk & Stalks",
    condition: "Dry",
    harvest_date: "2026-08-25",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 6,
    farmer_id: 7,
    farmer_name: "Chaudhary Ramphal Hooda",
    farmer_phone: "+91 98120 33488",
    quantity_tonnes: 340.0,
    asking_price_per_tonne: 1650.0,
    latitude: 28.8310,
    longitude: 76.3980,
    state: "Haryana",
    district: "Rohtak",
    village: "Kalanaur",
    crop: "Sugarcane",
    residue_type: "Sugarcane Trash",
    condition: "Dry",
    harvest_date: "2026-09-24",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 7,
    farmer_id: 8,
    farmer_name: "Jagdish Prasad Yadav",
    farmer_phone: "+91 94144 33466",
    quantity_tonnes: 240.0,
    asking_price_per_tonne: 1600.0,
    latitude: 27.8880,
    longitude: 76.2820,
    state: "Rajasthan",
    district: "Alwar",
    village: "Behror",
    crop: "Mustard",
    residue_type: "Mustard Husk",
    condition: "Dry",
    harvest_date: "2026-09-10",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    interest_count: 1
  },
  {
    id: 8,
    farmer_id: 9,
    farmer_name: "Bhawani Singh Rathore",
    farmer_phone: "+91 98295 44577",
    quantity_tonnes: 510.0,
    asking_price_per_tonne: 1500.0,
    latitude: 24.9200,
    longitude: 76.2800,
    state: "Rajasthan",
    district: "Kota",
    village: "Sangod",
    crop: "Sugarcane",
    residue_type: "Sugarcane Bagasse & Trash",
    condition: "Semi-Dry",
    harvest_date: "2026-10-06",
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    interest_count: 1
  }
];

export const MOCK_BUYERS = [
  {
    buyer_id: "BUYER-LDH-01",
    buyer_name: "EverGreen Bio-Energy & CBG Plant Ltd",
    buyer_type: "Bio-CNG / CBG Plant",
    state: "Punjab",
    district: "Ludhiana",
    latitude: 30.9010,
    longitude: 75.8573,
    offered_price: 2350.0,
    capacity_tonnes: 6500.0,
    is_available: true,
    contact_number: "+91 98765 11223",
    preferred_material: "Paddy Straw Bales",
    is_certified: true
  },
  {
    buyer_id: "BUYER-BTI-02",
    buyer_name: "Malwa Bio-Pellet & Briquette Works",
    buyer_type: "Biomass Pellet Manufacturer",
    state: "Punjab",
    district: "Bathinda",
    latitude: 30.2110,
    longitude: 74.9455,
    offered_price: 2100.0,
    capacity_tonnes: 3200.0,
    is_available: true,
    contact_number: "+91 98144 88711",
    preferred_material: "Cotton Residue & Paddy Straw",
    is_certified: true
  },
  {
    buyer_id: "BUYER-KRN-03",
    buyer_name: "Karnal Eco-Cardboard & Paper Mills",
    buyer_type: "Paper & Packaging Board Mill",
    state: "Haryana",
    district: "Karnal",
    latitude: 29.6857,
    longitude: 76.9905,
    offered_price: 2500.0,
    capacity_tonnes: 4500.0,
    is_available: true,
    contact_number: "+91 94164 22044",
    preferred_material: "Wheat Straw & Paddy Straw",
    is_certified: true
  },
  {
    buyer_id: "BUYER-SGN-04",
    buyer_name: "Shekhawat Bio-Refineries & Green Coal",
    buyer_type: "Bio-Coal & Bio-Refinery",
    state: "Rajasthan",
    district: "Sri Ganganagar",
    latitude: 29.9038,
    longitude: 73.8772,
    offered_price: 1750.0,
    capacity_tonnes: 5500.0,
    is_available: true,
    contact_number: "+91 94142 66488",
    preferred_material: "Mustard Husk & Cotton Residue",
    is_certified: true
  },
  {
    buyer_id: "BUYER-PNP-05",
    buyer_name: "Panipat Thermal Co-Firing Aggregation Hub",
    buyer_type: "Thermal Power Aggregator",
    state: "Haryana",
    district: "Panipat",
    latitude: 29.3909,
    longitude: 76.9635,
    offered_price: 2200.0,
    capacity_tonnes: 9500.0,
    is_available: true,
    contact_number: "+91 98124 33155",
    preferred_material: "Baled Straw & Sugarcane Trash",
    is_certified: true
  },
  {
    buyer_id: "BUYER-ALW-06",
    buyer_name: "Matsya Eco-Packaging & Board Ltd",
    buyer_type: "Eco-Packaging Manufacturer",
    state: "Rajasthan",
    district: "Alwar",
    latitude: 27.5530,
    longitude: 76.6346,
    offered_price: 1800.0,
    capacity_tonnes: 2800.0,
    is_available: true,
    contact_number: "+91 98292 77599",
    preferred_material: "Sugarcane Trash & Mustard Husk",
    is_certified: true
  }
];

export const MOCK_STATES = [
  { id: "punjab", name: "Punjab" },
  { id: "haryana", name: "Haryana" },
  { id: "rajasthan", name: "Rajasthan" }
];

export const MOCK_DISTRICTS = {
  punjab: [
    { id: "ludhiana", name: "Ludhiana" },
    { id: "bathinda", name: "Bathinda" },
    { id: "patiala", name: "Patiala" },
    { id: "amritsar", name: "Amritsar" },
    { id: "sangrur", name: "Sangrur" },
    { id: "jalandhar", name: "Jalandhar" },
    { id: "firozpur", name: "Firozpur" }
  ],
  haryana: [
    { id: "karnal", name: "Karnal" },
    { id: "kurukshetra", name: "Kurukshetra" },
    { id: "panipat", name: "Panipat" },
    { id: "ambala", name: "Ambala" },
    { id: "hisar", name: "Hisar" },
    { id: "rohtak", name: "Rohtak" }
  ],
  rajasthan: [
    { id: "sri_ganganagar", name: "Sri Ganganagar" },
    { id: "hanumangarh", name: "Hanumangarh" },
    { id: "alwar", name: "Alwar" },
    { id: "kota", name: "Kota" },
    { id: "bikaner", name: "Bikaner" }
  ]
};
