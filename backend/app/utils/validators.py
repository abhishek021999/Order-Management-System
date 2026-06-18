"""
Validation utilities for request data.
"""

import re
from app.utils.exceptions import ValidationError


def validate_email(email: str) -> str:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError(f"Invalid email format: {email}")
    return email


def validate_phone(phone: str) -> str:
    """Validate phone number format."""
    # Accept various phone formats
    pattern = r'^[\d\s\-\+\(\)]{10,}$'
    if not re.match(pattern, phone):
        raise ValidationError(f"Invalid phone number format: {phone}")
    return phone


def validate_positive_number(value: float, field_name: str) -> float:
    """Validate that a number is positive."""
    if value <= 0:
        raise ValidationError(f"{field_name} must be positive, got {value}")
    return value


def validate_non_negative_number(value: int, field_name: str) -> int:
    """Validate that a number is non-negative."""
    if value < 0:
        raise ValidationError(f"{field_name} cannot be negative, got {value}")
    return value


def validate_sku(sku: str) -> str:
    """Validate SKU format (alphanumeric with optional hyphens)."""
    pattern = r'^[a-zA-Z0-9\-_]{3,50}$'
    if not re.match(pattern, sku):
        raise ValidationError(
            f"Invalid SKU format: {sku}. SKU must be 3-50 alphanumeric characters"
        )
    return sku


def validate_string_length(value: str, min_len: int, max_len: int, field_name: str) -> str:
    """Validate string length constraints."""
    if not (min_len <= len(value) <= max_len):
        raise ValidationError(
            f"{field_name} must be between {min_len} and {max_len} characters"
        )
    return value
