"""
Product service — plain functions containing business logic.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.exceptions import (
    ResourceNotFoundError,
    DuplicateResourceError,
    ValidationError,
    DatabaseError,
)


def create_product(db: Session, product: ProductCreate) -> Product:
    """Create a new product. Raises DuplicateResourceError if SKU already exists."""
    try:
        existing = db.query(Product).filter(Product.sku == product.sku).first()
        if existing:
            raise DuplicateResourceError("SKU", product.sku)

        db_product = Product(**product.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except DuplicateResourceError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def get_products(
    db: Session, skip: int = 0, limit: int = 10
) -> tuple[list[Product], int]:
    """Return a paginated list of products and the total count."""
    try:
        total = db.query(func.count(Product.id)).scalar()
        products = db.query(Product).offset(skip).limit(limit).all()
        return products, total
    except Exception as e:
        raise DatabaseError(str(e))


def get_product(db: Session, product_id: int) -> Product:
    """Return a single product by ID. Raises ResourceNotFoundError if missing."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ResourceNotFoundError("Product", product_id)
    return product


def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Product:
    """Update mutable product fields. SKU is immutable once created."""
    try:
        db_product = get_product(db, product_id)

        if product_update.name is not None:
            db_product.name = product_update.name
        if product_update.price is not None:
            db_product.price = product_update.price
        if product_update.quantity is not None:
            db_product.quantity = product_update.quantity
        if product_update.description is not None:
            db_product.description = product_update.description

        db.commit()
        db.refresh(db_product)
        return db_product
    except ResourceNotFoundError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def delete_product(db: Session, product_id: int) -> None:
    """Delete a product by ID. Raises ValidationError if the product has existing orders."""
    try:
        from app.models.order import OrderItem
        db_product = get_product(db, product_id)

        linked = db.query(OrderItem).filter(OrderItem.product_id == product_id).first()
        if linked:
            raise ValidationError(
                f"Cannot delete '{db_product.name}' because it is referenced by existing orders. "
                "Cancel or delete the associated orders first."
            )

        db.delete(db_product)
        db.commit()
    except (ResourceNotFoundError, ValidationError):
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def reduce_inventory(db: Session, product_id: int, quantity: int) -> Product:
    """Reduce stock by quantity. Raises ValidationError if stock is insufficient."""
    try:
        db_product = get_product(db, product_id)

        if db_product.quantity < quantity:
            raise ValidationError(
                f"Insufficient inventory for {db_product.name}. "
                f"Available: {db_product.quantity}, Requested: {quantity}"
            )

        db_product.quantity -= quantity
        db.commit()
        db.refresh(db_product)
        return db_product
    except (ResourceNotFoundError, ValidationError):
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def get_low_stock_products(db: Session, threshold: int = 10) -> list[Product]:
    """Return products whose stock is at or below the given threshold."""
    try:
        return db.query(Product).filter(Product.quantity <= threshold).all()
    except Exception as e:
        raise DatabaseError(str(e))
