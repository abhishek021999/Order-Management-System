"""
Custom exceptions for the application.
"""

from fastapi import HTTPException, status


class ResourceNotFoundError(HTTPException):
    """Raised when a resource is not found."""
    def __init__(self, resource_name: str, resource_id: int):
        self.status_code = status.HTTP_404_NOT_FOUND
        self.detail = f"{resource_name} with id {resource_id} not found"
        super().__init__(status_code=self.status_code, detail=self.detail)


class DuplicateResourceError(HTTPException):
    """Raised when trying to create a duplicate unique resource."""
    def __init__(self, field_name: str, field_value: str):
        self.status_code = status.HTTP_409_CONFLICT
        self.detail = f"{field_name} '{field_value}' already exists"
        super().__init__(status_code=self.status_code, detail=self.detail)


class InsufficientInventoryError(HTTPException):
    """Raised when product quantity is insufficient."""
    def __init__(self, product_name: str, available: int, requested: int):
        self.status_code = status.HTTP_400_BAD_REQUEST
        self.detail = (
            f"Insufficient inventory for {product_name}. "
            f"Available: {available}, Requested: {requested}"
        )
        super().__init__(status_code=self.status_code, detail=self.detail)


class ValidationError(HTTPException):
    """Raised when business-logic validation fails."""
    def __init__(self, message: str):
        self.status_code = status.HTTP_400_BAD_REQUEST
        self.detail = message
        super().__init__(status_code=self.status_code, detail=self.detail)


class DatabaseError(HTTPException):
    """Raised when database operation fails."""
    def __init__(self, message: str = "Database operation failed"):
        self.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        self.detail = message
        super().__init__(status_code=self.status_code, detail=self.detail)
