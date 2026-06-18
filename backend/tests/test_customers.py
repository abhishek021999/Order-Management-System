"""
Tests for /api/customers endpoints.
"""


def test_create_customer(client):
    resp = client.post(
        "/api/customers",
        json={"full_name": "John Smith", "email": "john@example.com", "phone_number": "555-010-0001"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "john@example.com"
    assert data["full_name"] == "John Smith"
    assert "id" in data


def test_create_customer_duplicate_email(client, sample_customer):
    resp = client.post(
        "/api/customers",
        json={"full_name": "Jane Copy", "email": sample_customer["email"]},
    )
    assert resp.status_code == 409


def test_create_customer_invalid_email(client):
    resp = client.post(
        "/api/customers",
        json={"full_name": "Bad Email", "email": "not-an-email"},
    )
    assert resp.status_code == 422


def test_list_customers(client, sample_customer):
    resp = client.get("/api/customers")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert isinstance(data["items"], list)


def test_get_customer(client, sample_customer):
    resp = client.get(f"/api/customers/{sample_customer['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == sample_customer["id"]


def test_get_customer_not_found(client):
    resp = client.get("/api/customers/99999")
    assert resp.status_code == 404


def test_update_customer(client, sample_customer):
    resp = client.put(
        f"/api/customers/{sample_customer['id']}",
        json={"full_name": "Jane Updated", "phone_number": "555-999-9999"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["full_name"] == "Jane Updated"
    assert data["phone_number"] == "555-999-9999"
    # Email must remain unchanged
    assert data["email"] == sample_customer["email"]


def test_delete_customer(client, sample_customer):
    resp = client.delete(f"/api/customers/{sample_customer['id']}")
    assert resp.status_code == 204

    resp = client.get(f"/api/customers/{sample_customer['id']}")
    assert resp.status_code == 404
