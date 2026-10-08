from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import State, District, Village

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.get("/states")
def get_states(db: Session = Depends(get_db)):
    states = db.query(State).order_by(State.name).all()
    
    # Priority sorting: Punjab, Haryana, Rajasthan first
    priority = ["PB", "HR", "RJ"]
    sorted_states = []
    
    for pid in priority:
        s = next((st for st in states if st.id == pid), None)
        if s:
            sorted_states.append(s)
            
    for st in states:
        if st.id not in priority:
            sorted_states.append(st)
            
    return [{"id": s.id, "name": s.name} for s in sorted_states]

@router.get("/states/{state_id}/districts")
def get_districts(state_id: str, db: Session = Depends(get_db)):
    districts = db.query(District).filter(District.state_id == state_id).order_by(District.name).all()
    if not districts:
        return []
    return [{"id": d.id, "name": d.name, "state_id": d.state_id} for d in districts]

@router.get("/districts/{district_id}/villages")
def get_villages(district_id: str, db: Session = Depends(get_db)):
    villages = db.query(Village).filter(Village.district_id == district_id).order_by(Village.name).all()
    if not villages:
        return []
    return [{"id": v.id, "name": v.name, "district_id": v.district_id} for v in villages]
