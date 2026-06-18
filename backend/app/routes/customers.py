"""
Customer API routes.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse,
)
from app.services import customer_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
    description="Create a customer with a unique email. Returns 409 if email already exists.",
)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    return customer_service.create_customer(db, customer)


@router.get(
    "",
    response_model=CustomerListResponse,
    summary="List all customers",
    description="Get a paginated list of all customers.",
)
def list_customers(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=500, description="Number of items to return"),
    db: Session = Depends(get_db),
):
    customers, total = customer_service.get_customers(db, skip, limit)
    page = (skip // limit) + 1
    return {"total": total, "page": page, "page_size": limit, "items": customers}


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get customer by ID",
    description="Retrieve a specific customer by their ID.",
)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer(db, customer_id)


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update customer",
    description="Update customer name, phone number, or address. Email is immutable.",
)
def update_customer(
    customer_id: int,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db),
):
    return customer_service.update_customer(db, customer_id, customer_update)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete customer",
    description="Permanently delete a customer by ID.",
)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service.delete_customer(db, customer_id)
    return None
