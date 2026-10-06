// Demo marketplace listings based on Punjab & Haryana agricultural clusters
// Clearly labeled as Demo Marketplace Listings (NOT real transactions, NOT ML data)
export const DEMO_MARKETPLACE_LISTINGS = [
  {
    id: "LIST-LDH-101",
    farmer_name: "Gurpreet Singh (Demo)",
    district: "Ludhiana",
    state: "Punjab",
    latitude: 30.9010,
    longitude: 75.8573,
    stubble_quantity_tonnes: 32.5,
    crop_year: 2026,
    season: "Kharif",
    asking_price_per_tonne: 2100,
    is_available: true,
    contact_number: "+91 98761 11223"
  },
  {
    id: "LIST-PTL-102",
    farmer_name: "Harbhajan Singh (Demo)",
    district: "Patiala",
    state: "Punjab",
    latitude: 30.3398,
    longitude: 76.3869,
    stubble_quantity_tonnes: 45.0,
    crop_year: 2026,
    season: "Kharif",
    asking_price_per_tonne: 2050,
    is_available: true,
    contact_number: "+91 98124 22334"
  },
  {
    id: "LIST-KRN-103",
    farmer_name: "Rameshwar Sharma (Demo)",
    district: "Karnal",
    state: "Haryana",
    latitude: 29.6857,
    longitude: 76.9905,
    stubble_quantity_tonnes: 60.0,
    crop_year: 2026,
    season: "Kharif",
    asking_price_per_tonne: 2200,
    is_available: true,
    contact_number: "+91 94161 33445"
  },
  {
    id: "LIST-JLD-104",
    farmer_name: "Manjeet Kaur (Demo)",
    district: "Jalandhar",
    state: "Punjab",
    latitude: 31.3260,
    longitude: 75.5762,
    stubble_quantity_tonnes: 28.0,
    crop_year: 2026,
    season: "Kharif",
    asking_price_per_tonne: 1950,
    is_available: true,
    contact_number: "+91 98723 44556"
  },
  {
    id: "LIST-BTI-105",
    farmer_name: "Balwinder Brar (Demo)",
    district: "Bathinda",
    state: "Punjab",
    latitude: 30.2110,
    longitude: 74.9455,
    stubble_quantity_tonnes: 75.0,
    crop_year: 2026,
    season: "Kharif",
    asking_price_per_tonne: 2250,
    is_available: true,
    contact_number: "+91 98141 55667"
  },
  {
    id: "LIST-SNG-106",
    farmer_name: "Kuldeep Dhillon (Demo)",
    district: "Sangrur",
    state: "Punjab",
    latitude: 30.2458,
    longitude: 75.8421,
    stubble_quantity_tonnes: 50.0,
    crop_year: 2026,
    season: "Kharif",
    asking_price_per_tonne: 2150,
    is_available: false,
    contact_number: "+91 98881 66778"
  }
];

// Haversine distance utility
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * Math.PI / 180.0;
  const dLon = (lon2 - lon1) * Math.PI / 180.0;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180.0) * Math.cos(lat2 * Math.PI / 180.0) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
