"""
Order schema definitions for request/response validation.
"""

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime


class CustomerBrief(BaseModel):
    """Minimal customer info embedded in order responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None


class OrderItemBase(BaseModel):
    """Base order item schema."""

    product_id: int = Field(..., gt=0, description="Product ID")
    quantity: int = Field(..., gt=0, description="Quantity ordered")


class OrderItemCreate(OrderItemBase):
    """Schema for creating order items."""
    pass


class OrderItemResponse(OrderItemBase):
    """Schema for order item response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    unit_price: float
    subtotal: float
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    created_at: datetime


class OrderBase(BaseModel):
    """Base order schema."""

    customer_id: int = Field(..., gt=0, description="Customer ID")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order items")

    @field_validator('items')
    @classmethod
    def items_not_empty(cls, v):
        if not v:
            raise ValueError('Order must contain at least one item')
        return v


class OrderCreate(OrderBase):
    """Schema for creating a new order."""
    pass


class OrderUpdate(BaseModel):
    """Schema for updating an order."""

    status: Optional[str] = Field(None, description="Order status")

    @field_validator('status')
    @classmethod
    def status_valid(cls, v):
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if v and v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v


class OrderResponse(BaseModel):
    """Schema for order response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    customer: Optional[CustomerBrief] = None
    total_amount: float
    status: str
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime


class OrderListResponse(BaseModel):
    """Schema for order list response."""

    total: int
    page: int
    page_size: int
    items: list[OrderResponse]


class DashboardStats(BaseModel):
    """Schema for dashboard statistics."""

    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[dict]
    total_revenue: float
