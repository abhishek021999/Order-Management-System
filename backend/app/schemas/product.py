"""
Product schema definitions for request/response validation.
"""

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    """Base product schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=3, max_length=100, description="Product SKU/Code")
    price: float = Field(..., gt=0, description="Product price")
    quantity: int = Field(default=0, ge=0, description="Quantity in stock")
    description: Optional[str] = Field(default=None, max_length=1000, description="Product description")
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip()
    
    @field_validator('sku')
    @classmethod
    def sku_format(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('SKU must contain only alphanumeric characters, hyphens, and underscores')
        return v.upper()


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=1000)
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip() if v else v


class ProductResponse(ProductBase):
    """Schema for product response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    """Schema for product list response."""
    
    total: int
    page: int
    page_size: int
    items: list[ProductResponse]
