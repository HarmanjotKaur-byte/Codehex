import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\backend\main.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Patch create_stubble_listing
old_create = """    listing = StubbleListing(
        farmer_id=farmer.id,
        quantity_tonnes=req.quantity_tonnes,
        asking_price_per_tonne=req.asking_price_per_tonne,
        latitude=req.latitude,
        longitude=req.longitude,
        district=req.district,
        state=req.state,
        available_until=req.available_until,
        status=ListingStatus.AVAILABLE
    )"""

new_create = """    listing = StubbleListing(
        farmer_id=farmer.id,
        quantity_tonnes=req.quantity_tonnes,
        asking_price_per_tonne=req.asking_price_per_tonne,
        latitude=req.latitude,
        longitude=req.longitude,
        district=req.district,
        state=req.state,
        village=req.village,
        crop=req.crop,
        residue_type=req.residue_type,
        condition=req.condition,
        harvest_date=req.harvest_date,
        available_until=req.available_until,
        status=ListingStatus.AVAILABLE
    )"""
content = content.replace(old_create, new_create)

# Patch create response
old_create_resp = """    return StubbleListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price_per_tonne=listing.asking_price_per_tonne,
        latitude=listing.latitude,
        longitude=listing.longitude,
        district=listing.district,
        state=listing.state,
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=0
    )"""

new_create_resp = """    return StubbleListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price_per_tonne=listing.asking_price_per_tonne,
        latitude=listing.latitude,
        longitude=listing.longitude,
        district=listing.district,
        state=listing.state,
        village=listing.village,
        crop=listing.crop,
        residue_type=listing.residue_type,
        condition=listing.condition,
        harvest_date=listing.harvest_date,
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=0
    )"""
content = content.replace(old_create_resp, new_create_resp)

# Patch get my listings
old_get_my = """    return [
        StubbleListingResponse(
            id=l.id,
            farmer_id=l.farmer_id,
            farmer_name=farmer.full_name,
            farmer_phone=farmer.phone,
            quantity_tonnes=l.quantity_tonnes,
            asking_price_per_tonne=l.asking_price_per_tonne,
            latitude=l.latitude,
            longitude=l.longitude,
            district=l.district,
            state=l.state,
            status=l.status.value,
            created_at=l.created_at,
            interest_count=len(l.interests)
        )
        for l in listings
    ]"""

new_get_my = """    return [
        StubbleListingResponse(
            id=l.id,
            farmer_id=l.farmer_id,
            farmer_name=farmer.full_name,
            farmer_phone=farmer.phone,
            quantity_tonnes=l.quantity_tonnes,
            asking_price_per_tonne=l.asking_price_per_tonne,
            latitude=l.latitude,
            longitude=l.longitude,
            district=l.district,
            state=l.state,
            village=l.village,
            crop=l.crop,
            residue_type=l.residue_type,
            condition=l.condition,
            harvest_date=l.harvest_date,
            status=l.status.value,
            created_at=l.created_at,
            interest_count=len(l.interests)
        )
        for l in listings
    ]"""
content = content.replace(old_get_my, new_get_my)

# Patch update_farmer_listing body
old_update_body = """    if req.quantity_tonnes is not None:
        listing.quantity_tonnes = req.quantity_tonnes
    if req.asking_price_per_tonne is not None:
        listing.asking_price_per_tonne = req.asking_price_per_tonne
    if req.status is not None:
        try:
            listing.status = ListingStatus(req.status.upper())
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid listing status.")"""

new_update_body = """    if req.quantity_tonnes is not None:
        listing.quantity_tonnes = req.quantity_tonnes
    if req.asking_price_per_tonne is not None:
        listing.asking_price_per_tonne = req.asking_price_per_tonne
    if req.village is not None:
        listing.village = req.village
    if req.crop is not None:
        listing.crop = req.crop
    if req.residue_type is not None:
        listing.residue_type = req.residue_type
    if req.condition is not None:
        listing.condition = req.condition
    if req.harvest_date is not None:
        listing.harvest_date = req.harvest_date
    if req.status is not None:
        try:
            listing.status = ListingStatus(req.status.upper())
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid listing status.")"""
content = content.replace(old_update_body, new_update_body)

# Patch update_farmer_listing response
old_update_resp = """    return StubbleListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price_per_tonne=listing.asking_price_per_tonne,
        latitude=listing.latitude,
        longitude=listing.longitude,
        district=listing.district,
        state=listing.state,
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=len(listing.interests)
    )"""

new_update_resp = """    return StubbleListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        quantity_tonnes=listing.quantity_tonnes,
        asking_price_per_tonne=listing.asking_price_per_tonne,
        latitude=listing.latitude,
        longitude=listing.longitude,
        district=listing.district,
        state=listing.state,
        village=listing.village,
        crop=listing.crop,
        residue_type=listing.residue_type,
        condition=listing.condition,
        harvest_date=listing.harvest_date,
        status=listing.status.value,
        created_at=listing.created_at,
        interest_count=len(listing.interests)
    )"""
content = content.replace(old_update_resp, new_update_resp)

# Add delete_farmer_listing endpoint if it doesn't exist
if "def delete_farmer_listing" not in content:
    delete_endpoint = """
@app.delete("/api/listings/{listing_id}", tags=["Marketplace"])
async def delete_farmer_listing(
    listing_id: int,
    farmer: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    listing = db.query(StubbleListing).filter(StubbleListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.farmer_id != farmer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own listings.")
    
    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully"}
"""
    content += delete_endpoint

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("main.py patched.")
