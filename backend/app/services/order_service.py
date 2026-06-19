"""
Order service — plain functions containing business logic.
"""

from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderUpdate
from app.utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    DatabaseError,
)
from app.services import product_service, customer_service
from app.services import notification_service

LOW_STOCK_THRESHOLD = 10


def create_order(db: Session, order: OrderCreate) -> Order:
    try:
        customer = customer_service.get_customer(db, order.customer_id)

        total_amount = Decimal("0.00")
        order_items_data: list[dict] = []

        for item in order.items:
            product = product_service.get_product(db, item.product_id)

            if product.quantity < item.quantity:
                raise ValidationError(
                    f"Insufficient inventory for '{product.name}'. "
                    f"Available: {product.quantity}, Requested: {item.quantity}"
                )

            subtotal = Decimal(str(product.price)) * Decimal(str(item.quantity))
            total_amount += subtotal
            order_items_data.append({
                "product_id": item.product_id,
                "product_name": product.name,
                "quantity": item.quantity,
                "unit_price": Decimal(str(product.price)),
                "subtotal": subtotal,
            })

        db_order = Order(
            customer_id=order.customer_id,
            total_amount=total_amount,
            status="pending",
        )
        db.add(db_order)
        db.flush()

        for item_data in order_items_data:
            db.add(OrderItem(
                order_id=db_order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"],
            ))
            product = product_service.get_product(db, item_data["product_id"])
            product.quantity -= item_data["quantity"]

        db.commit()
        db.refresh(db_order)
        result = get_order(db, db_order.id)

        # Publish notifications after successful commit
        notification_service.publish("order_created", {
            "order_id": result.id,
            "customer_name": customer.full_name,
            "total_amount": float(total_amount),
            "items_count": len(order_items_data),
        })

        # Check for low/out-of-stock after deduction
        for item_data in order_items_data:
            product = product_service.get_product(db, item_data["product_id"])
            if product.quantity <= LOW_STOCK_THRESHOLD:
                notification_service.publish("low_stock", {
                    "product_id": product.id,
                    "product_name": product.name,
                    "quantity": product.quantity,
                })

        return result
    except (ResourceNotFoundError, ValidationError):
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def _order_with_relations(query):
    return query.options(
        joinedload(Order.customer),
        joinedload(Order.order_items).joinedload(OrderItem.product),
    )


def get_orders(db: Session, skip: int = 0, limit: int = 10) -> tuple[list[Order], int]:
    try:
        total = db.query(func.count(Order.id)).scalar()
        orders = (
            _order_with_relations(db.query(Order))
            .offset(skip)
            .limit(limit)
            .all()
        )
        return orders, total
    except Exception as e:
        raise DatabaseError(str(e))


def get_order(db: Session, order_id: int) -> Order:
    order = (
        _order_with_relations(db.query(Order))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise ResourceNotFoundError("Order", order_id)
    return order


def update_order(db: Session, order_id: int, order_update: OrderUpdate) -> Order:
    try:
        db_order = get_order(db, order_id)
        old_status = db_order.status

        if order_update.status is not None:
            new_status = order_update.status
            # Restore inventory when cancelling a non-cancelled order
            if new_status == "cancelled" and old_status != "cancelled":
                for item in db_order.order_items:
                    product = product_service.get_product(db, item.product_id)
                    product.quantity += item.quantity
            db_order.status = new_status

        db.commit()
        db.refresh(db_order)
        result = get_order(db, order_id)

        notification_service.publish("order_status_changed", {
            "order_id": result.id,
            "old_status": old_status,
            "new_status": result.status,
            "customer_name": result.customer.full_name if result.customer else "",
        })

        return result
    except ResourceNotFoundError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def delete_order(db: Session, order_id: int) -> None:
    try:
        db_order = get_order(db, order_id)

        for item in db_order.order_items:
            product = product_service.get_product(db, item.product_id)
            product.quantity += item.quantity

        order_id_copy = db_order.id
        db.delete(db_order)
        db.commit()

        notification_service.publish("order_deleted", {"order_id": order_id_copy})
    except ResourceNotFoundError:
        raise
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))


def get_orders_by_customer(
    db: Session, customer_id: int, skip: int = 0, limit: int = 10
) -> tuple[list[Order], int]:
    try:
        total = (
            db.query(func.count(Order.id))
            .filter(Order.customer_id == customer_id)
            .scalar()
        )
        orders = (
            _order_with_relations(db.query(Order))
            .filter(Order.customer_id == customer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return orders, total
    except Exception as e:
        raise DatabaseError(str(e))


def get_total_revenue(db: Session) -> Decimal:
    try:
        total = (
            db.query(func.sum(Order.total_amount))
            .filter(Order.status != "cancelled")
            .scalar()
        )
        return total or Decimal("0.00")
    except Exception as e:
        raise DatabaseError(str(e))
