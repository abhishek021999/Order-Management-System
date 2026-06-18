"""
Tests for /api/products endpoints.
"""


def test_create_product(client):
    resp = client.post(
        "/api/products",
        json={"name": "Widget A", "sku": "WGT-001", "price": 9.99, "quantity": 50},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["sku"] == "WGT-001"
    assert data["price"] == 9.99
    assert data["quantity"] == 50
    assert "id" in data


def test_create_product_duplicate_sku(client, sample_product):
    resp = client.post(
        "/api/products",
        json={"name": "Another Widget", "sku": sample_product["sku"], "price": 5.00, "quantity": 10},
    )
    assert resp.status_code == 409


def test_create_product_invalid_price(client):
    resp = client.post(
        "/api/products",
        json={"name": "Bad Product", "sku": "BAD-001", "price": -1, "quantity": 10},
    )
    assert resp.status_code == 422


def test_create_product_negative_quantity(client):
    resp = client.post(
        "/api/products",
        json={"name": "Bad Product", "sku": "BAD-002", "price": 1.00, "quantity": -5},
    )
    assert resp.status_code == 422


def test_list_products(client, sample_product):
    resp = client.get("/api/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert isinstance(data["items"], list)


def test_get_product(client, sample_product):
    resp = client.get(f"/api/products/{sample_product['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == sample_product["id"]


def test_get_product_not_found(client):
    resp = client.get("/api/products/99999")
    assert resp.status_code == 404


def test_update_product(client, sample_product):
    resp = client.put(
        f"/api/products/{sample_product['id']}",
        json={"price": 29.99, "quantity": 200},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["price"] == 29.99
    assert data["quantity"] == 200
    # SKU must remain unchanged
    assert data["sku"] == sample_product["sku"]


def test_delete_product(client, sample_product):
    resp = client.delete(f"/api/products/{sample_product['id']}")
    assert resp.status_code == 204

    resp = client.get(f"/api/products/{sample_product['id']}")
    assert resp.status_code == 404


def test_sku_is_uppercased(client):
    resp = client.post(
        "/api/products",
        json={"name": "Lowercase SKU", "sku": "abc-123", "price": 1.00, "quantity": 10},
    )
    assert resp.status_code == 201
    assert resp.json()["sku"] == "ABC-123"
