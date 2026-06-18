"""
Order API routes.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import (
    OrderCreate, OrderUpdate, OrderResponse, OrderListResponse, DashboardStats,
)
from app.services import order_service, product_service
from app.models.customer import Customer
from app.models.order import Order

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description=(
        "Create an order with one or more line items. "
        "Stock is validated and deducted atomically; total is auto-calculated."
    ),
)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, order)


@router.get(
    "",
    response_model=OrderListResponse,
    summary="List all orders",
    description="Get a paginated list of all orders with customer and item details.",
)
def list_orders(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=500, description="Number of items to return"),
    db: Session = Depends(get_db),
):
    orders, total = order_service.get_orders(db, skip, limit)
    page = (skip // limit) + 1
    return {"total": total, "page": page, "page_size": limit, "items": orders}


# Static paths must come BEFORE parameterised paths so FastAPI matches them first.

@router.get(
    "/stats/dashboard",
    response_model=DashboardStats,
    summary="Dashboard statistics",
    description="Summary counts, low-stock products, and total revenue.",
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    from app.models.product import Product

    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    low_stock = db.query(Product).filter(Product.quantity <= 10).all()
    low_stock_data = [
        {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity}
        for p in low_stock
    ]

    total_revenue = order_service.get_total_revenue(db)

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_data,
        "total_revenue": float(total_revenue),
    }


@router.get(
    "/customer/{customer_id}",
    response_model=OrderListResponse,
    summary="Get orders by customer",
    description="Get all orders placed by a specific customer.",
)
def get_customer_orders(
    customer_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=500),
    db: Session = Depends(get_db),
):
    orders, total = order_service.get_orders_by_customer(db, customer_id, skip, limit)
    page = (skip // limit) + 1
    return {"total": total, "page": page, "page_size": limit, "items": orders}


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order by ID",
    description="Retrieve a specific order by ID, including all line items and customer info.",
)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)


@router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update order status",
    description="Change the status of an existing order (pending → confirmed → shipped → delivered | cancelled).",
)
def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
):
    return order_service.update_order(db, order_id, order_update)


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel / delete order",
    description="Delete an order and restore inventory for every line item.",
)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order_service.delete_order(db, order_id)
    return None
