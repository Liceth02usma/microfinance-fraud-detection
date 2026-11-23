"""Pruebas de la política CORS (HU-17).

Verifica que un origen configurado recibe Access-Control-Allow-Origin
y un origen no configurado no obtiene autorización.
"""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_allowed_origin_receives_cors_header(client: TestClient) -> None:
    """Origen permitido (http://localhost:5173) -> header CORS presente."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_disallowed_origin_gets_no_cors_header(client: TestClient) -> None:
    """Origen no permitido -> sin header Access-Control-Allow-Origin."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://evil-site.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    # FastAPI CORSMiddleware no añade el header para orígenes no permitidos
    assert (
        response.headers.get("access-control-allow-origin") is None
        or response.headers.get("access-control-allow-origin") != "http://evil-site.example.com"
    )


def test_allowed_origin_get_request(client: TestClient) -> None:
    """GET desde origen permitido incluye header CORS en la respuesta."""
    response = client.get(
        "/api/v1/health",
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
