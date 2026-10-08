import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    GOVERNMENT = "GOVERNMENT"
    SUPER_ADMIN = "SUPER_ADMIN"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class ListingStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"
    CANCELLED = "CANCELLED"

class InterestStatus(str, enum.Enum):
    INTERESTED = "INTERESTED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.FARMER)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    government_profile = relationship(
        "GovernmentProfile",
        foreign_keys="GovernmentProfile.user_id",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    listings = relationship("StubbleListing", back_populates="farmer", cascade="all, delete-orphan")
    interests = relationship("BuyerInterest", back_populates="buyer", cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    state = Column(String(100), nullable=True, default="Punjab")
    district = Column(String(100), nullable=True, default="Ludhiana")
    village = Column(String(150), nullable=True)
    state_id = Column(String(50), nullable=True)
    district_id = Column(String(100), nullable=True)
    village_id = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True, default=30.9000)
    longitude = Column(Float, nullable=True, default=75.8573)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="farmer_profile")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    buyer_type = Column(String(100), nullable=True, default="Biomass Aggregator")
    state = Column(String(100), nullable=True, default="Punjab")
    district = Column(String(100), nullable=True, default="Ludhiana")
    state_id = Column(String(50), nullable=True)
    district_id = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True, default=30.9000)
    longitude = Column(Float, nullable=True, default=75.8573)
    phone = Column(String(50), nullable=True)
    preferred_material = Column(String(150), nullable=True, default="Paddy Straw Bales")
    required_quantity_tonnes = Column(Float, nullable=True, default=100.0)
    max_distance_km = Column(Float, nullable=True, default=100.0)
    budget_per_tonne = Column(Float, nullable=True, default=2000.0)
    purchase_frequency = Column(String(100), nullable=True, default="Regular / Seasonal")
    additional_requirements = Column(Text, nullable=True)
    verification_status = Column(String(50), nullable=True, default="PENDING")
    document_type = Column(String(100), nullable=True)
    document_id_number = Column(String(150), nullable=True)
    document_url = Column(String(500), nullable=True)
    is_certified = Column(Boolean, default=False, nullable=False)
    location_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="buyer_profile")

class GovernmentProfile(Base):
    __tablename__ = "government_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department = Column(String(200), nullable=False)
    designation = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False, default="Punjab")
    district = Column(String(100), nullable=False, default="Ludhiana")
    state_id = Column(String(50), nullable=True)
    district_id = Column(String(100), nullable=True)
    employee_id = Column(String(100), nullable=False)
    official_email = Column(String(255), nullable=True)
    verification_document = Column(String(500), nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.VERIFIED, nullable=False)
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id], back_populates="government_profile")
    verifier = relationship("User", foreign_keys=[verified_by])

class StubbleListing(Base):
    __tablename__ = "stubble_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quantity_tonnes = Column(Float, nullable=False)
    asking_price_per_tonne = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=True)
    village = Column(String(150), nullable=True)
    crop = Column(String(100), nullable=True)
    residue_type = Column(String(100), nullable=True)
    condition = Column(String(100), nullable=True)
    harvest_date = Column(String(50), nullable=True)
    state = Column(String(100), nullable=True)
    available_from = Column(DateTime, nullable=True, default=datetime.utcnow)
    available_until = Column(DateTime, nullable=True)
    status = Column(SQLEnum(ListingStatus), default=ListingStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    farmer = relationship("User", back_populates="listings")
    interests = relationship("BuyerInterest", back_populates="listing", cascade="all, delete-orphan")

class BuyerInterest(Base):
    __tablename__ = "buyer_interests"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("stubble_listings.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(SQLEnum(InterestStatus), default=InterestStatus.INTERESTED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    listing = relationship("StubbleListing", back_populates="interests")
    buyer = relationship("User", back_populates="interests")

class ContactRequest(Base):
    """Farmer contacts a buyer (from BuyerMatching results) — on-site message."""
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    listing_id = Column(Integer, ForeignKey("stubble_listings.id", ondelete="SET NULL"), nullable=True)
    # Buyer's external name if not a registered user (from matching data)
    buyer_name_ref = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    # Farmer's stubble qty (context from match)
    stubble_qty = Column(Float, nullable=True)
    status = Column(String(50), default="INTERESTED", nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    farmer = relationship("User", foreign_keys=[farmer_id], backref="sent_contacts")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="received_contacts")
    listing = relationship("StubbleListing", foreign_keys=[listing_id])

class LocationState(Base):
    __tablename__ = 'location_states'
    id = Column(String(50), primary_key=True)
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    name_pa = Column(String(100), nullable=True)
    priority = Column(Integer, default=99)

class LocationDistrict(Base):
    __tablename__ = 'location_districts'
    id = Column(String(100), primary_key=True)
    state_id = Column(String(50), ForeignKey('location_states.id', ondelete='CASCADE'))
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    name_pa = Column(String(100), nullable=True)

class LocationVillage(Base):
    __tablename__ = 'location_villages'
    id = Column(String(100), primary_key=True)
    district_id = Column(String(100), ForeignKey('location_districts.id', ondelete='CASCADE'))
    name_en = Column(String(150), nullable=False)
    name_hi = Column(String(150), nullable=True)
    name_pa = Column(String(150), nullable=True)
