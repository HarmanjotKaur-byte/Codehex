import os
import sys
from datetime import datetime, timedelta
import bcrypt

# Ensure backend root is on Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import SessionLocal, engine, Base
from models import (
    User, UserRole, FarmerProfile, BuyerProfile, GovernmentProfile,
    StubbleListing, ListingStatus, BuyerInterest, InterestStatus,
    ContactRequest, VerificationStatus
)

def get_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Precompute standard hashes
DEMO_PASS_HASH = get_hash("SecurePassword2026!")
STD_PASS_HASH = get_hash("Password123!")

def seed_marketplace():
    db = SessionLocal()
    print("Beginning ParaliPay Comprehensive Marketplace Seeding...")

    try:
        # We will preserve or update existing e2e users, and clean existing listings/interests/contacts to establish clean relational integrity.
        db.query(BuyerInterest).delete()
        db.query(ContactRequest).delete()
        db.query(StubbleListing).delete()
        
        # Remove old test farmers/buyers (keep government officers and demo accounts if needed)
        existing_users = db.query(User).all()
        for u in existing_users:
            if u.email not in ["e2e_gov@punjab.gov.in", "gov_test@punjab.gov.in", "manpreet.singh@punjab.gov.in"]:
                # Delete related profiles
                if u.farmer_profile:
                    db.delete(u.farmer_profile)
                if u.buyer_profile:
                    db.delete(u.buyer_profile)
                db.delete(u)
        db.commit()

        # --------------------------------------------------------------------------
        # 1. CORE DEMO USERS (Preserving E2E Logins)
        # --------------------------------------------------------------------------
        e2e_farmer = User(
            full_name="Harmanpreet Singh Brar",
            email="e2e_farmer@punjab.in",
            phone="+91 98150 24680",
            password_hash=DEMO_PASS_HASH,
            role=UserRole.FARMER,
            is_active=True
        )
        db.add(e2e_farmer)
        db.flush()

        e2e_farmer_profile = FarmerProfile(
            user_id=e2e_farmer.id,
            state="Punjab",
            district="Ludhiana",
            village="Jagraon",
            latitude=30.7850,
            longitude=75.4780
        )
        db.add(e2e_farmer_profile)

        e2e_buyer = User(
            full_name="Vikramaditya Singhania",
            email="e2e_buyer@biomassenergy.com",
            phone="+91 98765 11223",
            password_hash=DEMO_PASS_HASH,
            role=UserRole.BUYER,
            is_active=True
        )
        db.add(e2e_buyer)
        db.flush()

        e2e_buyer_profile = BuyerProfile(
            user_id=e2e_buyer.id,
            business_name="EverGreen Bio-Energy & CBG Plant Ltd",
            buyer_type="Bio-CNG / CBG Plant",
            state="Punjab",
            district="Ludhiana",
            latitude=30.9010,
            longitude=75.8573,
            phone="+91 98765 11223",
            preferred_material="Paddy Straw Bales",
            required_quantity_tonnes=6500.0,
            max_distance_km=120.0,
            budget_per_tonne=2350.0,
            purchase_frequency="Regular Daily Feedstock",
            additional_requirements="Standard rectangular 25-30 kg bales, moisture content below 15%. Dedicated weighbridge at GT Road plant entrance.",
            verification_status="VERIFIED",
            document_type="GSTIN & CPCB License",
            document_id_number="03AAACE4589K1Z5",
            is_certified=True,
            location_address="Plot 44-48, Focal Point Phase VII, Ludhiana, Punjab 141010"
        )
        db.add(e2e_buyer_profile)

        # Ensure E2E Government officer exists
        e2e_gov = db.query(User).filter(User.email == "e2e_gov@punjab.gov.in").first()
        if not e2e_gov:
            e2e_gov = User(
                full_name="Dr. Simranjit Kaur",
                email="e2e_gov@punjab.gov.in",
                phone="+91 98141 99887",
                password_hash=DEMO_PASS_HASH,
                role=UserRole.GOVERNMENT,
                is_active=True
            )
            db.add(e2e_gov)
            db.flush()
            gov_profile = GovernmentProfile(
                user_id=e2e_gov.id,
                department="Punjab Pollution Control Board (PPCB)",
                designation="District Environmental Engineer",
                state="Punjab",
                district="Ludhiana",
                employee_id="PPCB-LUD-2024-089",
                official_email="simranjit.kaur@ppcb.gov.in",
                verification_status=VerificationStatus.VERIFIED
            )
            db.add(gov_profile)

        db.commit()

        # --------------------------------------------------------------------------
        # 2. DIVERSE FARMERS DATASET (PUNJAB, HARYANA, RAJASTHAN)
        # --------------------------------------------------------------------------
        farmers_data = [
            # PUNJAB
            {
                "full_name": "Balwinder Singh Sidhu",
                "email": "balwinder.sidhu@malwafarms.in",
                "phone": "+91 98142 33411",
                "state": "Punjab", "district": "Bathinda", "village": "Talwandi Sabo",
                "lat": 29.9880, "lon": 75.0860,
                "crop": "Cotton", "residue_type": "Cotton Stalks",
                "qty": 210.0, "price": 1850.0, "condition": "Dry",
                "harvest_date": "2026-10-02", "status": ListingStatus.AVAILABLE,
                "desc": "Machine shredded dry cotton stalks from BT-cotton acreage. Free moisture under 10%. Highly suitable for industrial briquetting."
            },
            {
                "full_name": "Gurdeep Singh Gill",
                "email": "gurdeep.gill@sangruragro.org",
                "phone": "+91 98720 44522",
                "state": "Punjab", "district": "Sangrur", "village": "Sunam",
                "lat": 30.1280, "lon": 75.7990,
                "crop": "Paddy (Rice)", "residue_type": "Loose Straw",
                "qty": 540.0, "price": 1900.0, "condition": "Semi-Dry",
                "harvest_date": "2026-10-05", "status": ListingStatus.RESERVED,
                "desc": "Basmati PB-1121 crop residue spread on 60 acres. Easy tractor rake approach. Immediate baler access available."
            },
            {
                "full_name": "Sukhdev Singh Sandhu",
                "email": "sukhdev.sandhu@nabhafarms.in",
                "phone": "+91 94172 55633",
                "state": "Punjab", "district": "Patiala", "village": "Nabha",
                "lat": 30.3750, "lon": 76.1520,
                "crop": "Wheat", "residue_type": "Wheat Straw (Turi)",
                "qty": 320.0, "price": 2650.0, "condition": "Dry",
                "harvest_date": "2026-09-18", "status": ListingStatus.SOLD,
                "desc": "Clean golden threshed wheat straw (turi) stored dry in covered tin godown. Ideal for dairy forage and clean bio-coal."
            },
            {
                "full_name": "Paramjit Singh Randhawa",
                "email": "paramjit.randhawa@amritsargreen.in",
                "phone": "+91 98881 66744",
                "state": "Punjab", "district": "Amritsar", "village": "Ajnala",
                "lat": 31.8400, "lon": 74.7600,
                "crop": "Paddy (Rice)", "residue_type": "Baled Straw",
                "qty": 360.0, "price": 2200.0, "condition": "Dry",
                "harvest_date": "2026-10-01", "status": ListingStatus.AVAILABLE,
                "desc": "Square baled PR-126 paddy straw. Moisture tested at 12.8%. Certified clean without soil mixing, weighbridge within 2 km."
            },
            {
                "full_name": "Karamjit Singh Virk",
                "email": "karamjit.virk@nakodaragri.com",
                "phone": "+91 98155 77855",
                "state": "Punjab", "district": "Jalandhar", "village": "Nakodar",
                "lat": 31.1270, "lon": 75.4740,
                "crop": "Maize", "residue_type": "Maize Stover",
                "qty": 185.0, "price": 1800.0, "condition": "Dry",
                "harvest_date": "2026-09-28", "status": ListingStatus.AVAILABLE,
                "desc": "Chopped maize stalks and cobs. Low silica, high burning efficiency. Suitable for ethanol distillation units."
            },
            {
                "full_name": "Jagmohan Singh Dhillon",
                "email": "jagmohan.dhillon@ferozepurbio.in",
                "phone": "+91 94170 88966",
                "state": "Punjab", "district": "Firozpur", "village": "Zira",
                "lat": 30.9750, "lon": 74.9880,
                "crop": "Paddy (Rice)", "residue_type": "Baled Straw",
                "qty": 420.0, "price": 2180.0, "condition": "Dry",
                "harvest_date": "2026-10-04", "status": ListingStatus.AVAILABLE,
                "desc": "Dense rectangular bales of 28 kg each. Roadside stacking on state highway SH-15 with ample turnaround for 16-wheelers."
            },

            # HARYANA
            {
                "full_name": "Rajinder Kumar Sharma",
                "email": "rajinder.sharma@karnalbiomass.in",
                "phone": "+91 94161 22377",
                "state": "Haryana", "district": "Karnal", "village": "Nilokheri",
                "lat": 29.8330, "lon": 76.9200,
                "crop": "Paddy (Rice)", "residue_type": "Baled Straw",
                "qty": 480.0, "price": 2350.0, "condition": "Dry",
                "harvest_date": "2026-10-03", "status": ListingStatus.AVAILABLE,
                "desc": "Round bales from GPS-monitored non-burnt fields. Direct tractor loading equipment available on site."
            },
            {
                "full_name": "Chaudhary Ramphal Hooda",
                "email": "ramphal.hooda@rohtakagri.org",
                "phone": "+91 98120 33488",
                "state": "Haryana", "district": "Rohtak", "village": "Kalanaur",
                "lat": 28.8310, "lon": 76.3980,
                "crop": "Sugarcane", "residue_type": "Sugarcane Trash",
                "qty": 340.0, "price": 1650.0, "condition": "Dry",
                "harvest_date": "2026-09-24", "status": ListingStatus.AVAILABLE,
                "desc": "Sun-dried sugarcane leaves and tops post crushing season. Excellent organic fiber for bio-coal and particle boards."
            },
            {
                "full_name": "Manjeet Singh Chahal",
                "email": "manjeet.chahal@kaithaleco.in",
                "phone": "+91 94165 44599",
                "state": "Haryana", "district": "Kaithal", "village": "Pundri",
                "lat": 29.7560, "lon": 76.5510,
                "crop": "Paddy (Rice)", "residue_type": "Baled Straw",
                "qty": 290.0, "price": 2150.0, "condition": "Semi-Dry",
                "harvest_date": "2026-10-06", "status": ListingStatus.AVAILABLE,
                "desc": "Freshly cut PR-131 stubble baled into standard 18 kg bundles. 16,000 bundles ready for rapid pickup."
            },
            {
                "full_name": "Rajeshwar Bishnoi",
                "email": "rajeshwar.bishnoi@fatehabadbio.in",
                "phone": "+91 98125 55600",
                "state": "Haryana", "district": "Fatehabad", "village": "Tohana",
                "lat": 29.7040, "lon": 75.9010,
                "crop": "Cotton", "residue_type": "Cotton Stalks",
                "qty": 175.0, "price": 1750.0, "condition": "Dry",
                "harvest_date": "2026-09-30", "status": ListingStatus.AVAILABLE,
                "desc": "Root-cut bundled cotton stalks. Ash content under 3.8%. Ideal for gasifiers and heavy biomass boilers."
            },
            {
                "full_name": "Sunil Dutt Tyagi",
                "email": "sunil.tyagi@panipatagri.com",
                "phone": "+91 94168 66711",
                "state": "Haryana", "district": "Panipat", "village": "Samalkha",
                "lat": 29.2380, "lon": 77.0120,
                "crop": "Maize", "residue_type": "Maize Stover",
                "qty": 150.0, "price": 1800.0, "condition": "Dry",
                "harvest_date": "2026-09-25", "status": ListingStatus.AVAILABLE,
                "desc": "Chopped dry corn stalks and husks. Low moisture (11%), tested calorific value 3,600 kcal/kg."
            },
            {
                "full_name": "Narender Singh Dahiya",
                "email": "narender.dahiya@kurukshetrabio.in",
                "phone": "+91 98129 77822",
                "state": "Haryana", "district": "Kurukshetra", "village": "Shahbad",
                "lat": 30.1660, "lon": 76.8710,
                "crop": "Paddy (Rice)", "residue_type": "Baled Straw",
                "qty": 430.0, "price": 2280.0, "condition": "Dry",
                "harvest_date": "2026-10-05", "status": ListingStatus.AVAILABLE,
                "desc": "High-density square bales from 75-acre laser leveled farm. Reliable highway access 1 km from GT Road."
            },
            {
                "full_name": "Virender Kumar Malik",
                "email": "virender.malik@ambalaagri.in",
                "phone": "+91 94162 88933",
                "state": "Haryana", "district": "Ambala", "village": "Barara",
                "lat": 30.2180, "lon": 77.0420,
                "crop": "Wheat", "residue_type": "Wheat Straw",
                "qty": 260.0, "price": 2550.0, "condition": "Dry",
                "harvest_date": "2026-09-12", "status": ListingStatus.AVAILABLE,
                "desc": "Golden clean bhusa stored on raised concrete floor covered with commercial tarpaulins."
            },

            # RAJASTHAN
            {
                "full_name": "Mahendra Pratap Shekhawat",
                "email": "mahendra.shekhawat@marwarbio.in",
                "phone": "+91 94140 11244",
                "state": "Rajasthan", "district": "Sri Ganganagar", "village": "Sadulshahar",
                "lat": 29.9200, "lon": 74.0500,
                "crop": "Mustard", "residue_type": "Mustard Husk & Stalks",
                "qty": 650.0, "price": 1550.0, "condition": "Dry",
                "harvest_date": "2026-08-25", "status": ListingStatus.AVAILABLE,
                "desc": "Bulk dry mustard straw (sarson dandi) aggregate. High gross calorific value (3,850 kcal/kg). Massive quantity ready for power plants."
            },
            {
                "full_name": "Om Prakash Meena",
                "email": "omprakash.meena@hanumangarhagri.in",
                "phone": "+91 98290 22355",
                "state": "Rajasthan", "district": "Hanumangarh", "village": "Pilibanga",
                "lat": 29.4580, "lon": 74.0820,
                "crop": "Wheat", "residue_type": "Wheat Straw",
                "qty": 380.0, "price": 2400.0, "condition": "Dry",
                "harvest_date": "2026-09-15", "status": ListingStatus.SOLD,
                "desc": "Machine packed wheat straw bundles in dry canal colony warehouse. Fully inspected and sold out."
            },
            {
                "full_name": "Jagdish Prasad Yadav",
                "email": "jagdish.yadav@alwarbio.in",
                "phone": "+91 94144 33466",
                "state": "Rajasthan", "district": "Alwar", "village": "Behror",
                "lat": 27.8880, "lon": 76.2820,
                "crop": "Mustard", "residue_type": "Mustard Husk",
                "qty": 240.0, "price": 1600.0, "condition": "Dry",
                "harvest_date": "2026-09-10", "status": ListingStatus.AVAILABLE,
                "desc": "Dry threshed mustard pods and husk. Located on NH-48 Delhi-Jaipur corridor for quick transport dispatch."
            },
            {
                "full_name": "Bhawani Singh Rathore",
                "email": "bhawani.rathore@kotabiomass.in",
                "phone": "+91 98295 44577",
                "state": "Rajasthan", "district": "Kota", "village": "Sangod",
                "lat": 24.9200, "lon": 76.2800,
                "crop": "Sugarcane", "residue_type": "Sugarcane Bagasse & Trash",
                "qty": 510.0, "price": 1500.0, "condition": "Semi-Dry",
                "harvest_date": "2026-10-06", "status": ListingStatus.AVAILABLE,
                "desc": "Seasonally harvested sugarcane trash from Chambal canal basin. Bulk dispatch possible via railway freight siding nearby."
            },
            {
                "full_name": "Gordhan Ram Choudhary",
                "email": "gordhan.choudhary@bikanerbio.in",
                "phone": "+91 94148 55688",
                "state": "Rajasthan", "district": "Bikaner", "village": "Lunkaransar",
                "lat": 28.4900, "lon": 73.7400,
                "crop": "Mustard", "residue_type": "Mustard Husk",
                "qty": 310.0, "price": 1580.0, "condition": "Dry",
                "harvest_date": "2026-09-05", "status": ListingStatus.AVAILABLE,
                "desc": "Screened mustard residue from arid irrigation zone. Zero soil content, dry moisture 8.5%."
            }
        ]

        farmer_users = {}
        farmer_listings = {}

        # Add E2E farmer's prime listing
        e2e_listing = StubbleListing(
            farmer_id=e2e_farmer.id,
            quantity_tonnes=380.0,
            asking_price_per_tonne=2150.0,
            latitude=30.7850,
            longitude=75.4780,
            district="Ludhiana",
            village="Jagraon",
            state="Punjab",
            crop="Paddy (Rice)",
            residue_type="Baled Straw",
            condition="Dry",
            harvest_date="2026-09-28",
            status=ListingStatus.AVAILABLE,
            available_from=datetime.utcnow() - timedelta(days=5),
            available_until=datetime.utcnow() + timedelta(days=25)
        )
        db.add(e2e_listing)
        db.flush()
        farmer_listings["e2e_farmer"] = e2e_listing

        for f_data in farmers_data:
            u = User(
                full_name=f_data["full_name"],
                email=f_data["email"],
                phone=f_data["phone"],
                password_hash=STD_PASS_HASH,
                role=UserRole.FARMER,
                is_active=True
            )
            db.add(u)
            db.flush()

            fp = FarmerProfile(
                user_id=u.id,
                state=f_data["state"],
                district=f_data["district"],
                village=f_data["village"],
                latitude=f_data["lat"],
                longitude=f_data["lon"]
            )
            db.add(fp)

            listing = StubbleListing(
                farmer_id=u.id,
                quantity_tonnes=f_data["qty"],
                asking_price_per_tonne=f_data["price"],
                latitude=f_data["lat"],
                longitude=f_data["lon"],
                district=f_data["district"],
                village=f_data["village"],
                state=f_data["state"],
                crop=f_data["crop"],
                residue_type=f_data["residue_type"],
                condition=f_data["condition"],
                harvest_date=f_data["harvest_date"],
                status=f_data["status"],
                available_from=datetime.utcnow() - timedelta(days=3),
                available_until=datetime.utcnow() + timedelta(days=30)
            )
            db.add(listing)
            db.flush()

            farmer_users[f_data["email"]] = u
            farmer_listings[f_data["email"]] = listing

        db.commit()
        print(f"Created {len(farmers_data) + 1} realistic farmers & listings across Punjab, Haryana, Rajasthan.")

        # --------------------------------------------------------------------------
        # 3. DIVERSE BUYERS DATASET (PUNJAB, HARYANA, RAJASTHAN)
        # --------------------------------------------------------------------------
        buyers_data = [
            # PUNJAB
            {
                "full_name": "Jaspreet Singh Sidhu",
                "email": "jaspreet.sidhu@malwapellets.com",
                "phone": "+91 98144 88711",
                "business_name": "Malwa Bio-Pellet & Briquette Works",
                "buyer_type": "Biomass Pellet Manufacturer",
                "state": "Punjab", "district": "Bathinda",
                "lat": 30.2110, "lon": 74.9455,
                "preferred_material": "Cotton Residue & Paddy Straw",
                "qty": 3200.0, "max_dist": 90.0, "price": 2100.0,
                "address": "Industrial Growth Centre, Mansa Road, Bathinda, Punjab 151001",
                "doc_id": "03BBBPS9821M1Z4",
                "requirements": "Seeking dry cotton stalks and baled paddy straw for 8mm export grade biofuel pellets. Immediate RTGS payment upon moisture verification."
            },
            {
                "full_name": "Amardeep Singh Cheema",
                "email": "amardeep.cheema@punjabpower.org",
                "phone": "+91 98725 99822",
                "business_name": "Punjab Renewable Energy & Cogeneration Corp",
                "buyer_type": "Biomass Power Plant",
                "state": "Punjab", "district": "Patiala",
                "lat": 30.3398, "lon": 76.3869,
                "preferred_material": "Paddy Straw Bales",
                "qty": 14000.0, "max_dist": 150.0, "price": 2250.0,
                "address": "Thermal Plant Complex, Sirhind Bypass, Patiala, Punjab 147001",
                "doc_id": "03AAACP1245P1Z8",
                "requirements": "18 MW grid-connected biomass thermal unit. Guaranteed long-term seasonal procurement agreements for farmer clusters and FPOs."
            },
            {
                "full_name": "Satnam Singh Grewal",
                "email": "satnam.grewal@doabaclean.in",
                "phone": "+91 98158 11933",
                "business_name": "Doaba Eco-Straw Processing Mills",
                "buyer_type": "Biomass Aggregator",
                "state": "Punjab", "district": "Jalandhar",
                "lat": 31.3260, "lon": 75.5762,
                "preferred_material": "Maize Residue & Paddy Straw",
                "qty": 2000.0, "max_dist": 60.0, "price": 2050.0,
                "address": "Transport Nagar, Focal Point Extension, Jalandhar, Punjab 144004",
                "doc_id": "03AAGCD8762D1Z1",
                "requirements": "Regular supply for poultry heating and briquetting plants across Doaba region. We deploy our own transport trailers."
            },

            # HARYANA
            {
                "full_name": "Virender Kumar Goel",
                "email": "virender.goel@karnalcardboard.com",
                "phone": "+91 94164 22044",
                "business_name": "Karnal Eco-Cardboard & Paper Mills",
                "buyer_type": "Paper & Packaging Board Mill",
                "state": "Haryana", "district": "Karnal",
                "lat": 29.6857, "lon": 76.9905,
                "preferred_material": "Wheat Straw & Paddy Straw",
                "qty": 4500.0, "max_dist": 80.0, "price": 2500.0,
                "address": "Plot 12-15, Sector 3, HSIIDC Industrial Estate, Karnal, Haryana 132001",
                "doc_id": "06AAACK9842C1Z6",
                "requirements": "Unbleached kraft paper board production. Clean, unburnt wheat and rice straw without plastic or mud contamination."
            },
            {
                "full_name": "Sanjay Bansal",
                "email": "sanjay.bansal@panipatcofire.in",
                "phone": "+91 98124 33155",
                "business_name": "Panipat Thermal Co-Firing Aggregation Hub",
                "buyer_type": "Thermal Power Aggregator",
                "state": "Haryana", "district": "Panipat",
                "lat": 29.3909, "lon": 76.9635,
                "preferred_material": "Baled Straw & Sugarcane Trash",
                "qty": 9500.0, "max_dist": 110.0, "price": 2200.0,
                "address": "Near NTPC Co-firing Depot, Assandh Road, Panipat, Haryana 132103",
                "doc_id": "06AABBP3321B1Z2",
                "requirements": "NTPC co-firing authorized supply vendor. Accepting continuous supply of high-density square bales throughout harvest window."
            },
            {
                "full_name": "Deepak Bishnoi",
                "email": "deepak.bishnoi@hisarbiofuel.com",
                "phone": "+91 94169 44266",
                "business_name": "Hisar Bio-Fuels & Briquetting LLP",
                "buyer_type": "Biomass Briquette Manufacturer",
                "state": "Haryana", "district": "Hisar",
                "lat": 29.1492, "lon": 75.7217,
                "preferred_material": "Cotton Stalks & Mustard Husk",
                "qty": 2400.0, "max_dist": 75.0, "price": 1900.0,
                "address": "Industrial Area, Delhi Road, Hisar, Haryana 125005",
                "doc_id": "06AAEFH7761H1Z9",
                "requirements": "Need dry cotton stalks and mustard dandi for 90mm industrial white coal briquettes. Immediate unloading facility."
            },
            {
                "full_name": "Satish Kumar Saini",
                "email": "satish.saini@kurukshetradairy.in",
                "phone": "+91 98126 55377",
                "business_name": "Kurukshetra Dairy Forage & Straw Aggregators",
                "buyer_type": "Cattle Feed & Dairy Cooperative",
                "state": "Haryana", "district": "Kurukshetra",
                "lat": 29.9695, "lon": 76.8783,
                "preferred_material": "Wheat Straw (Turi)",
                "qty": 1800.0, "max_dist": 50.0, "price": 2750.0,
                "address": "Grain Market Extension, Pipli, Kurukshetra, Haryana 136131",
                "doc_id": "06AAKCS4412S1Z3",
                "requirements": "High-grade golden wheat straw turi for modern dairy farms across Haryana and NCR. Moisture below 10% preferred."
            },

            # RAJASTHAN
            {
                "full_name": "Kunwar Digvijay Singh Shekhawat",
                "email": "digvijay.shekhawat@ganganagargreen.in",
                "phone": "+91 94142 66488",
                "business_name": "Shekhawat Bio-Refineries & Green Coal",
                "buyer_type": "Bio-Coal & Bio-Refinery",
                "state": "Rajasthan", "district": "Sri Ganganagar",
                "lat": 29.9038, "lon": 73.8772,
                "preferred_material": "Mustard Husk & Cotton Residue",
                "qty": 5500.0, "max_dist": 140.0, "price": 1750.0,
                "address": "RIICO Industrial Area, Phase II, Sri Ganganagar, Rajasthan 335002",
                "doc_id": "08AAECS9911S1Z7",
                "requirements": "Mustard stalk shredding and torrefied green coal facility. Modern gantry crane available for hydraulic trailer unloading."
            },
            {
                "full_name": "Ashok Kumar Agarwal",
                "email": "ashok.agarwal@matsyapackaging.com",
                "phone": "+91 98292 77599",
                "business_name": "Matsya Eco-Packaging & Board Ltd",
                "buyer_type": "Eco-Packaging Manufacturer",
                "state": "Rajasthan", "district": "Alwar",
                "lat": 27.5530, "lon": 76.6346,
                "preferred_material": "Sugarcane Trash & Mustard Husk",
                "qty": 2800.0, "max_dist": 85.0, "price": 1800.0,
                "address": "Matsya Industrial Area (MIA), Alwar, Rajasthan 301030",
                "doc_id": "08AAACM6622M1Z5",
                "requirements": "Biodegradable tableware and molded pulp packaging plant. Low silica, clean washed or dust-screened raw agricultural residue."
            },
            {
                "full_name": "Rameshwar Dayal Meena",
                "email": "rameshwar.meena@chambalbio.in",
                "phone": "+91 94145 88600",
                "business_name": "Chambal Industrial Boiler Fuel Solutions",
                "buyer_type": "Industrial Boiler Fuel Supplier",
                "state": "Rajasthan", "district": "Kota",
                "lat": 25.2138, "lon": 75.8648,
                "preferred_material": "Sugarcane Residue & Maize Stover",
                "qty": 3600.0, "max_dist": 100.0, "price": 1650.0,
                "address": "DCM Road, Industrial Area, Kota, Rajasthan 324005",
                "doc_id": "08AAACC3388C1Z1",
                "requirements": "Direct fuel supplier to 14 synthetic yarn and chemical plants in Kota. Steady monthly dispatch required."
            },
            {
                "full_name": "Mangi Lal Chhangani",
                "email": "mangilal.chhangani@bikanergreen.in",
                "phone": "+91 98296 99711",
                "business_name": "Bikaner Desert Green Briquettes & Fuels",
                "buyer_type": "Biomass Briquetting Enterprise",
                "state": "Rajasthan", "district": "Bikaner",
                "lat": 28.0229, "lon": 73.3119,
                "preferred_material": "Mustard Husk & Cotton Residue",
                "qty": 2200.0, "max_dist": 180.0, "price": 1650.0,
                "address": "Karni Industrial Area, Bikaner, Rajasthan 334001",
                "doc_id": "08AABCB1199B1Z4",
                "requirements": "Screened mustard residue for high-pressure piston briquetting. Low moisture is prioritized."
            }
        ]

        buyer_users = {}
        buyer_profiles = {}

        # Add E2E buyer to map
        buyer_users["e2e_buyer@biomassenergy.com"] = e2e_buyer
        buyer_profiles["e2e_buyer@biomassenergy.com"] = e2e_buyer_profile

        for b_data in buyers_data:
            u = User(
                full_name=b_data["full_name"],
                email=b_data["email"],
                phone=b_data["phone"],
                password_hash=STD_PASS_HASH,
                role=UserRole.BUYER,
                is_active=True
            )
            db.add(u)
            db.flush()

            bp = BuyerProfile(
                user_id=u.id,
                business_name=b_data["business_name"],
                buyer_type=b_data["buyer_type"],
                state=b_data["state"],
                district=b_data["district"],
                latitude=b_data["lat"],
                longitude=b_data["lon"],
                phone=b_data["phone"],
                preferred_material=b_data["preferred_material"],
                required_quantity_tonnes=b_data["qty"],
                max_distance_km=b_data["max_dist"],
                budget_per_tonne=b_data["price"],
                purchase_frequency="Regular Commercial Supply",
                additional_requirements=b_data["requirements"],
                verification_status="VERIFIED",
                document_type="GSTIN & Industrial Pollution License",
                document_id_number=b_data["doc_id"],
                is_certified=True,
                location_address=b_data["address"]
            )
            db.add(bp)
            db.flush()

            buyer_users[b_data["email"]] = u
            buyer_profiles[b_data["email"]] = bp

        db.commit()
        print(f"Created {len(buyers_data) + 1} realistic buyers across Punjab, Haryana, Rajasthan.")

        # --------------------------------------------------------------------------
        # 4. REALISTIC MARKETPLACE RELATIONSHIPS (Interests & Contacts)
        # --------------------------------------------------------------------------
        # 4A. BuyerInterests (Buyers inquiring/interested in specific farmer listings)
        interests_data = [
            # EverGreen Bio-Energy (E2E Buyer) on E2E Farmer listing (Accepted!)
            {
                "buyer_email": "e2e_buyer@biomassenergy.com",
                "listing_key": "e2e_farmer",
                "message": "We have reviewed your 380 tonnes lot in Jagraon. We can deploy 4 semi-trailers starting this Monday. Gate price offered at ₹2,150/tonne.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 2
            },
            # EverGreen Bio-Energy on Paramjit Singh (Amritsar) listing (Accepted!)
            {
                "buyer_email": "e2e_buyer@biomassenergy.com",
                "listing_key": "paramjit.randhawa@amritsargreen.in",
                "message": "Can procure 200 tonnes from Ajnala. Please confirm gate weighment procedure.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 4
            },
            # Malwa Bio-Pellet (Bathinda) on Balwinder Singh (Bathinda Cotton) (Accepted - Local match ~27km!)
            {
                "buyer_email": "jaspreet.sidhu@malwapellets.com",
                "listing_key": "balwinder.sidhu@malwafarms.in",
                "message": "We are interested in the full 210 tonnes of cotton stalks. Our trucks can collect directly from Talwandi Sabo in 3 shifts.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 1
            },
            # Punjab Renewable Power (Patiala) on Gurdeep Singh (Sangrur) (Pending Inquiry ~45km)
            {
                "buyer_email": "amardeep.cheema@punjabpower.org",
                "listing_key": "gurdeep.gill@sangruragro.org",
                "message": "Reviewing 540 tonnes Basmati stubble for Patiala plant. Is baling machine assistance required on field?",
                "status": InterestStatus.INTERESTED,
                "days_ago": 3
            },
            # Karnal Eco-Cardboard on Rajinder Kumar Sharma (Karnal) (Accepted - Local match ~18km!)
            {
                "buyer_email": "virender.goel@karnalcardboard.com",
                "listing_key": "rajinder.sharma@karnalbiomass.in",
                "message": "We will take 300 tonnes immediately for our cardboard production line. Sending QA representative for sample test.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 3
            },
            # Panipat Thermal on Narender Singh Dahiya (Kurukshetra) (Pending Inquiry ~65km)
            {
                "buyer_email": "sanjay.bansal@panipatcofire.in",
                "listing_key": "narender.dahiya@kurukshetrabio.in",
                "message": "Checking dispatch slots for 430 tonnes PR-straw bales for Panipat power depot. Please share moisture test certificate.",
                "status": InterestStatus.INTERESTED,
                "days_ago": 2
            },
            # Hisar Bio-Fuels on Rajeshwar Bishnoi (Fatehabad Cotton) (Pending Inquiry ~48km)
            {
                "buyer_email": "deepak.bishnoi@hisarbiofuel.com",
                "listing_key": "rajeshwar.bishnoi@fatehabadbio.in",
                "message": "Interested in 175 tonnes cotton stalks. Would like to negotiate delivery freight to Hisar plant.",
                "status": InterestStatus.INTERESTED,
                "days_ago": 1
            },
            # Kurukshetra Dairy on Virender Kumar Malik (Ambala Wheat Straw) (Accepted ~28km!)
            {
                "buyer_email": "satish.saini@kurukshetradairy.in",
                "listing_key": "virender.malik@ambalaagri.in",
                "message": "Ready to purchase complete 260 tonnes wheat straw at ₹2,550/tonne for our dairy cooperative supply.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 5
            },
            # Shekhawat Bio-Refineries on Mahendra Pratap (Sri Ganganagar Mustard) (Accepted - Local match ~22km!)
            {
                "buyer_email": "digvijay.shekhawat@ganganagargreen.in",
                "listing_key": "mahendra.shekhawat@marwarbio.in",
                "message": "Confirmed order for 500 tonnes mustard dandi. Deploying our mobile shredder directly to your Sadulshahar godown.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 2
            },
            # Matsya Eco-Packaging on Jagdish Prasad (Alwar Mustard) (Accepted ~42km)
            {
                "buyer_email": "ashok.agarwal@matsyapackaging.com",
                "listing_key": "jagdish.yadav@alwarbio.in",
                "message": "Order confirmed for 240 tonnes clean mustard husk for our molded packaging division.",
                "status": InterestStatus.ACCEPTED,
                "days_ago": 6
            },
            # Chambal Boiler Solutions on Bhawani Singh (Kota Sugarcane) (Pending Inquiry ~35km)
            {
                "buyer_email": "rameshwar.meena@chambalbio.in",
                "listing_key": "bhawani.rathore@kotabiomass.in",
                "message": "Need 300 tonnes sugarcane trash next week for our textile boiler clients in Kota.",
                "status": InterestStatus.INTERESTED,
                "days_ago": 1
            },
            # Panipat Thermal on Chaudhary Ramphal Hooda (Rohtak Sugarcane) (Rejected due to low quote)
            {
                "buyer_email": "sanjay.bansal@panipatcofire.in",
                "listing_key": "ramphal.hooda@rohtakagri.org",
                "message": "Counter-offer of ₹1,400/tonne was below farmer expectation.",
                "status": InterestStatus.REJECTED,
                "days_ago": 7
            }
        ]

        for item in interests_data:
            buyer_u = buyer_users.get(item["buyer_email"])
            listing_obj = farmer_listings.get(item["listing_key"])
            if buyer_u and listing_obj:
                bi = BuyerInterest(
                    listing_id=listing_obj.id,
                    buyer_id=buyer_u.id,
                    message=item["message"],
                    status=item["status"],
                    created_at=datetime.utcnow() - timedelta(days=item["days_ago"])
                )
                db.add(bi)

        # 4B. ContactRequests (Farmer reaching out directly to a buyer)
        contacts_data = [
            # E2E Farmer reaching out to E2E Buyer
            {
                "farmer_email": "e2e_farmer@punjab.in",
                "buyer_email": "e2e_buyer@biomassenergy.com",
                "listing_key": "e2e_farmer",
                "qty": 380.0,
                "status": "ACCEPTED",
                "is_read": True,
                "msg": "Sat Sri Akal Vikramaditya ji. We have 380 tonnes of dry, clean rectangular bales ready at our Jagraon farm. Full truck access available."
            },
            # Paramjit Singh Randhawa contacting Punjab Renewable Power
            {
                "farmer_email": "paramjit.randhawa@amritsargreen.in",
                "buyer_email": "amardeep.cheema@punjabpower.org",
                "listing_key": "paramjit.randhawa@amritsargreen.in",
                "qty": 360.0,
                "status": "INTERESTED",
                "is_read": False,
                "msg": "Hello Cheema ji, we have 360 tonnes of PR-126 paddy straw in Ajnala. Can your logistics team arrange transport?"
            },
            # Chaudhary Ramphal Hooda contacting Panipat Thermal
            {
                "farmer_email": "ramphal.hooda@rohtakagri.org",
                "buyer_email": "sanjay.bansal@panipatcofire.in",
                "listing_key": "ramphal.hooda@rohtakagri.org",
                "qty": 340.0,
                "status": "INTERESTED",
                "is_read": True,
                "msg": "We have 340 tonnes of dried sugarcane tops in Rohtak. Ready for seasonal supply contract."
            },
            # Jagdish Prasad Yadav contacting Matsya Eco-Packaging
            {
                "farmer_email": "jagdish.yadav@alwarbio.in",
                "buyer_email": "ashok.agarwal@matsyapackaging.com",
                "listing_key": "jagdish.yadav@alwarbio.in",
                "qty": 240.0,
                "status": "ACCEPTED",
                "is_read": True,
                "msg": "Namaste Agarwal ji, our mustard husk batch is moisture-tested at 11.5% and stored safely in Behror."
            },
            # Karamjit Singh Virk contacting Doaba Clean Energy
            {
                "farmer_email": "karamjit.virk@nakodaragri.com",
                "buyer_email": "satnam.grewal@doabaclean.in",
                "listing_key": "karamjit.virk@nakodaragri.com",
                "qty": 185.0,
                "status": "REJECTED",
                "is_read": True,
                "msg": "Maize stover available in Nakodar. (Buyer required pelletized residue rather than raw stover)."
            }
        ]

        for c in contacts_data:
            farmer_u = farmer_users.get(c["farmer_email"]) or (e2e_farmer if c["farmer_email"] == "e2e_farmer@punjab.in" else None)
            buyer_u = buyer_users.get(c["buyer_email"])
            listing_obj = farmer_listings.get(c["listing_key"])
            if farmer_u and buyer_u:
                buyer_p = buyer_profiles.get(c["buyer_email"])
                b_name = buyer_p.business_name if buyer_p else buyer_u.full_name
                cr = ContactRequest(
                    farmer_id=farmer_u.id,
                    buyer_id=buyer_u.id,
                    listing_id=listing_obj.id if listing_obj else None,
                    buyer_name_ref=b_name,
                    message=c["msg"],
                    stubble_qty=c["qty"],
                    status=c["status"],
                    is_read=c["is_read"],
                    created_at=datetime.utcnow() - timedelta(days=2)
                )
                db.add(cr)

        db.commit()
        print(f"Created {len(interests_data)} BuyerInterests and {len(contacts_data)} ContactRequests.")

        # --------------------------------------------------------------------------
        # 5. UPDATE demo_buyers.json FOR OFFLINE / SMART MATCHING FALLBACK
        # --------------------------------------------------------------------------
        demo_json_path = os.path.join(backend_dir, "data", "demo_buyers.json")
        os.makedirs(os.path.dirname(demo_json_path), exist_ok=True)

        json_buyers = []
        # Add E2E buyer first
        json_buyers.append({
            "buyer_id": f"reg_{e2e_buyer_profile.id}",
            "buyer_name": e2e_buyer_profile.business_name,
            "latitude": float(e2e_buyer_profile.latitude),
            "longitude": float(e2e_buyer_profile.longitude),
            "offered_price": float(e2e_buyer_profile.budget_per_tonne),
            "capacity_tonnes": float(e2e_buyer_profile.required_quantity_tonnes),
            "is_available": True,
            "contact_number": e2e_buyer_profile.phone,
            "district": e2e_buyer_profile.district,
            "state": e2e_buyer_profile.state,
            "buyer_type": e2e_buyer_profile.buyer_type,
            "preferred_material": e2e_buyer_profile.preferred_material
        })

        for b in buyers_data:
            json_buyers.append({
                "buyer_id": f"BUYER-{b['district'][:3].upper()}-{abs(hash(b['email'])) % 900 + 100}",
                "buyer_name": b["business_name"],
                "latitude": float(b["lat"]),
                "longitude": float(b["lon"]),
                "offered_price": float(b["price"]),
                "capacity_tonnes": float(b["qty"]),
                "is_available": True,
                "contact_number": b["phone"],
                "district": b["district"],
                "state": b["state"],
                "buyer_type": b["buyer_type"],
                "preferred_material": b["preferred_material"]
            })

        import json
        with open(demo_json_path, "w", encoding="utf-8") as f:
            json.dump(json_buyers, f, indent=2, ensure_ascii=False)
        print(f"Updated {demo_json_path} with {len(json_buyers)} buyers across Punjab, Haryana, Rajasthan.")

        print("\nSeed Data Summary:")
        print(f"Total Users: {db.query(User).count()}")
        print(f"Total Listings: {db.query(StubbleListing).count()}")
        print(f"Total Buyer Profiles: {db.query(BuyerProfile).count()}")
        print(f"Total Interests: {db.query(BuyerInterest).count()}")
        print(f"Total Contacts: {db.query(ContactRequest).count()}")
        print("\nAll seed operations completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_marketplace()
