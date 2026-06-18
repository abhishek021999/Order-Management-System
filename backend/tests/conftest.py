"""
Shared pytest fixtures — SQLite in-memory DB, FastAPI TestClient.

DATABASE_URL must be set to SQLite BEFORE app.main is imported, because
database.py builds the engine at module level from settings.database_url.
"""

import os

# Override DB before any app module is imported
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.main import app  # noqa: E402
from app.database import Base, get_db  # noqa: E402

TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_product(client):
    resp = client.post(
        "/api/products",
        json={"name": "Widget A", "sku": "WGT-001", "price": 19.99, "quantity": 100},
    )
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def sample_customer(client):
    resp = client.post(
        "/api/customers",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone_number": "555-010-0001",
        },
    )
    assert resp.status_code == 201
    return resp.json()
