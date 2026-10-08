from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"

class UserResponse(BaseModel):
    role: str

    class Config:
        from_attributes = True

class MockUser:
    def __init__(self, role):
        self.role = role

obj = MockUser(UserRole.FARMER)
try:
    print(UserResponse.from_orm(obj).role)
except AttributeError:
    print(UserResponse.model_validate(obj).role)
