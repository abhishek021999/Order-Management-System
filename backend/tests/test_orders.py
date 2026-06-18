"""
Tests for /api/orders endpoints — covers all business-logic rules.
"""


def _create_order(client, customer_id: int, product_id: int, quantity: int = 2):
    return client.post(
        "/api/orders",
        json={"customer_id": customer_id, "items": [{"product_id": product_id, "quantity": quantity}]},
    )


def test_create_order(client, sample_product, sample_customer):
    resp = _create_order(client, sample_customer["id"], sample_product["id"])
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_id"] == sample_customer["id"]
    assert len(data["items"]) == 1
    assert data["status"] == "pending"
    # Total must equal price × qty
    expected_total = round(sample_product["price"] * 2, 2)
    assert round(data["total_amount"], 2) == expected_total


def test_create_order_reduces_stock(client, sample_product, sample_customer):
    initial_qty = sample_product["quantity"]
    _create_order(client, sample_customer["id"], sample_product["id"], quantity=3)

    resp = client.get(f"/api/products/{sample_product['id']}")
    assert resp.json()["quantity"] == initial_qty - 3


def test_create_order_insufficient_stock(client, sample_customer, sample_product):
    # Request more than available (100 in fixture)
    resp = _create_order(client, sample_customer["id"], sample_product["id"], quantity=9999)
    assert resp.status_code == 400


def test_create_order_invalid_customer(client, sample_product):
    resp = _create_order(client, 99999, sample_product["id"])
    assert resp.status_code == 404


def test_create_order_invalid_product(client, sample_customer):
    resp = _create_order(client, sample_customer["id"], 99999)
    assert resp.status_code == 404


def test_create_order_empty_items(client, sample_customer):
    resp = client.post(
        "/api/orders",
        json={"customer_id": sample_customer["id"], "items": []},
    )
    assert resp.status_code == 422


def test_list_orders(client, sample_product, sample_customer):
    _create_order(client, sample_customer["id"], sample_product["id"])
    resp = client.get("/api/orders")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1


def test_get_order(client, sample_product, sample_customer):
    order = _create_order(client, sample_customer["id"], sample_product["id"]).json()
    resp = client.get(f"/api/orders/{order['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == order["id"]
    # Customer info must be embedded
    assert resp.json()["customer"]["email"] == sample_customer["email"]
    # Product name must be embedded in items
    assert resp.json()["items"][0]["product_name"] == sample_product["name"]


def test_get_order_not_found(client):
    resp = client.get("/api/orders/99999")
    assert resp.status_code == 404


def test_update_order_status(client, sample_product, sample_customer):
    order = _create_order(client, sample_customer["id"], sample_product["id"]).json()
    resp = client.put(f"/api/orders/{order['id']}", json={"status": "confirmed"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmed"


def test_update_order_invalid_status(client, sample_product, sample_customer):
    order = _create_order(client, sample_customer["id"], sample_product["id"]).json()
    resp = client.put(f"/api/orders/{order['id']}", json={"status": "flying"})
    assert resp.status_code == 422


def test_delete_order_restores_stock(client, sample_product, sample_customer):
    initial_qty = sample_product["quantity"]
    order = _create_order(client, sample_customer["id"], sample_product["id"], quantity=5).json()

    client.delete(f"/api/orders/{order['id']}")

    resp = client.get(f"/api/products/{sample_product['id']}")
    assert resp.json()["quantity"] == initial_qty


def test_dashboard_stats(client, sample_product, sample_customer):
    _create_order(client, sample_customer["id"], sample_product["id"])
    resp = client.get("/api/orders/stats/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_products"] >= 1
    assert data["total_customers"] >= 1
    assert data["total_orders"] >= 1
    assert "total_revenue" in data
    assert isinstance(data["low_stock_products"], list)


def test_total_amount_auto_calculated(client, sample_product, sample_customer):
    resp = _create_order(client, sample_customer["id"], sample_product["id"], quantity=4)
    data = resp.json()
    expected = round(sample_product["price"] * 4, 2)
    assert round(data["total_amount"], 2) == expected
