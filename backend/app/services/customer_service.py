"""
Customer service — plain functions containing business logic.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.utils.exceptions import (
    ResourceNotFoundError,
    DuplicateResourceError,
    DatabaseError,
)


def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    """Create a new customer. Raises DuplicateResourceError if email is taken."""
    try:
        existing = db.query(Customer).filter(Customer.email == customer.email).first()
        if existing:
            raise DuplicateResourceError("Email", customer.email)

        db_customer = Customer(**customer.model_dump())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except DuplicateResourceError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def get_customers(
    db: Session, skip: int = 0, limit: int = 10
) -> tuple[list[Customer], int]:
    """Return a paginated list of customers and the total count."""
    try:
        total = db.query(func.count(Customer.id)).scalar()
        customers = db.query(Customer).offset(skip).limit(limit).all()
        return customers, total
    except Exception as e:
        raise DatabaseError(str(e))


def get_customer(db: Session, customer_id: int) -> Customer:
    """Return a single customer by ID. Raises ResourceNotFoundError if missing."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise ResourceNotFoundError("Customer", customer_id)
    return customer


def update_customer(
    db: Session, customer_id: int, customer_update: CustomerUpdate
) -> Customer:
    """Update mutable customer fields. Email is immutable once created."""
    try:
        db_customer = get_customer(db, customer_id)

        if customer_update.full_name is not None:
            db_customer.full_name = customer_update.full_name
        if customer_update.phone_number is not None:
            db_customer.phone_number = customer_update.phone_number
        if customer_update.address is not None:
            db_customer.address = customer_update.address

        db.commit()
        db.refresh(db_customer)
        return db_customer
    except ResourceNotFoundError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def delete_customer(db: Session, customer_id: int) -> None:
    """Delete a customer by ID."""
    try:
        db_customer = get_customer(db, customer_id)
        db.delete(db_customer)
        db.commit()
    except ResourceNotFoundError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def get_customer_order_count(db: Session, customer_id: int) -> int:
    """Return the number of orders placed by the customer."""
    try:
        db_customer = get_customer(db, customer_id)
        return len(db_customer.orders)
    except Exception as e:
        raise DatabaseError(str(e))
