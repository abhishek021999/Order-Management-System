"""
Customer schema definitions for request/response validation.
"""

from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class CustomerBase(BaseModel):
    """Base customer schema with common fields."""
    
    full_name: str = Field(..., min_length=1, max_length=255, description="Customer full name")
    email: EmailStr = Field(..., description="Customer email address")
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20, description="Customer phone number")
    address: Optional[str] = Field(None, max_length=1000, description="Customer address")
    
    @field_validator('full_name')
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip()
    
    @field_validator('phone_number')
    @classmethod
    def phone_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Phone number cannot be empty if provided')
        return v.strip() if v else v


class CustomerCreate(CustomerBase):
    """Schema for creating a new customer."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for updating a customer."""
    
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[str] = Field(None, max_length=1000)
    
    @field_validator('full_name')
    @classmethod
    def name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip() if v else v


class CustomerResponse(CustomerBase):
    """Schema for customer response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CustomerListResponse(BaseModel):
    """Schema for customer list response."""
    
    total: int
    page: int
    page_size: int
    items: list[CustomerResponse]
