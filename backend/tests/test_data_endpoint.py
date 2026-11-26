"""Pruebas del endpoint de regeneración de dataset (HU-06..08)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.schemas.data import DatasetGenerateResponse


def test_generate_dataset_writes_all_splits(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """POST /data/generate genera los 5 archivos en DATA_DIR (con params pequeños)."""
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    response = client.post(
        "/api/v1/data/generate",
        json={"n_records": 200, "fraud_rate": 0.04, "seed": 7},
    )
    assert response.status_code == 200, response.text
    parsed = DatasetGenerateResponse(**response.json())

    for path_str in (
        parsed.main_path,
        parsed.train_path,
        parsed.val_path,
        parsed.test_path,
        parsed.control_path,
    ):
        assert Path(path_str).exists(), path_str
        assert str(tmp_path) in path_str  # escrito en DATA_DIR, no en el repo

    assert parsed.n_records == 200
    assert parsed.seed == 7
    assert "reentrene" in parsed.warning


def test_generate_dataset_invalid_params_returns_422(client: TestClient) -> None:
    """n_records fuera de rango → 422 (validación del contrato)."""
    response = client.post("/api/v1/data/generate", json={"n_records": 5})
    assert response.status_code == 422


def test_generate_dataset_openapi(client: TestClient) -> None:
    """El OpenAPI describe POST /api/v1/data/generate."""
    spec = client.get("/openapi.json").json()
    assert "/api/v1/data/generate" in spec["paths"]
    post_op = spec["paths"]["/api/v1/data/generate"]["post"]
    assert (
        "DatasetGenerateRequest"
        in post_op["requestBody"]["content"]["application/json"]["schema"]["$ref"]
    )
    assert "DatasetGenerateResponse" in spec["components"]["schemas"]


@pytest.mark.parametrize("fraud_rate", [0.0, 0.5])
def test_generate_dataset_invalid_fraud_rate(client: TestClient, fraud_rate: float) -> None:
    """Tasa de fraude fuera de (0, 0.2) → 422."""
    response = client.post(
        "/api/v1/data/generate",
        json={"n_records": 200, "fraud_rate": fraud_rate},
    )
    assert response.status_code == 422
