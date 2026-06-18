"""
Product model definition.
"""

from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, CheckConstraint
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    """Product model representing inventory items."""
    
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('quantity >= 0', name='positive_quantity'),
        CheckConstraint('price > 0', name='positive_price'),
    )
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, sku={self.sku}, quantity={self.quantity})>"
