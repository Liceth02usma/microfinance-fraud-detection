"""Pruebas del endpoint de base de conocimiento y de la versión activa (HU-10, HU-26)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.core.versions import UNKNOWN_MODEL_VERSION, active_model_version, system_version


def test_knowledge_exposes_rules_and_fusion(client: TestClient) -> None:
    """La interfaz recibe exactamente las reglas y pesos que ejecuta el backend."""
    response = client.get("/api/v1/knowledge")
    assert response.status_code == 200
    body = response.json()
    assert 20 <= len(body["rules"]) <= 30
    categories = {r["categoria"] for r in body["rules"]}
    assert {"debil", "fuerte", "salvaguarda"} <= categories
    weights = body["fusion"]["weights"]
    assert abs(weights["rules"] + weights["bayesian"] + weights["ml"] - 1.0) < 1e-9
    assert body["fusion"]["verde_max"] < body["fusion"]["amarillo_max"]
    assert body["model_version"] == active_model_version()
    weak = [r for r in body["rules"] if r["categoria"] == "debil"]
    assert all(r["contexto_rural"] for r in weak)


def test_active_model_version_comes_from_artifact() -> None:
    """La versión se lee del archivo de métricas del modelo entrenado."""
    version = active_model_version()
    assert version != UNKNOWN_MODEL_VERSION
    assert "gradient-boosting" in version
    assert system_version("1.0.0", "2.0.0").startswith(f"ml={version}|")
