"""Pruebas de la auditoría ética (HU-04, HU-21) y su endpoint.

Cubre: IC de Wilson, estructura del reporte (FPR por grupo con CI, paridad
demográfica + Equalized Odds, métricas globales, sugerencia de umbral que no
se aplica solo), validación de parámetros y degradación amigable (503).
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.ethics.audit import clear_cache, wilson_interval
from app.schemas.ethics import EthicsAuditResponse


def test_wilson_interval_basic() -> None:
    """Wilson: 0 éxitos → IC [0, x]; éxito total → IC [x, 1]; n=0 → None."""
    low, high = wilson_interval(0, 100)
    assert low == 0.0
    assert high is not None and 0 < high < 0.1

    low, high = wilson_interval(50, 100)
    assert low is not None and high is not None
    assert low < 0.5 < high
    assert (low, high) == pytest.approx((0.4038, 0.5962), abs=0.01)

    assert wilson_interval(1, 0) == (None, None)


def test_audit_endpoint_returns_report(client: TestClient) -> None:
    """HU-21: GET /ethics/audit devuelve el reporte consolidado válido."""
    response = client.get("/api/v1/ethics/audit", params={"sample_size": 60})
    assert response.status_code == 200
    parsed = EthicsAuditResponse(**response.json())

    # Métricas globales
    gm = parsed.global_metrics
    assert gm.n_samples >= 40
    assert 0 <= gm.fraud_rate <= 1
    if gm.auc is not None:
        assert 0 <= gm.auc <= 1
    assert 0 <= gm.alert_rate <= 1

    # Tres variables protegidas auditadas (HU-04)
    attrs = {p.attribute for p in parsed.parity}
    assert attrs == {"tipo_zona", "genero", "pertenencia_etnica"}

    # FPR por grupo con IC de Wilson coherente
    assert len(parsed.fpr_by_group) >= 3  # al menos zona rural + urbana + más
    for group in parsed.fpr_by_group:
        assert group.n_samples > 0
        if group.fpr is not None:
            assert 0 <= group.fpr <= 1
            if group.fpr_ci_low is not None and group.fpr_ci_high is not None:
                assert group.fpr_ci_low <= group.fpr <= group.fpr_ci_high
        if group.sample_size_warning:
            assert group.n_samples < 30

    # Paridad: tasas de selección por grupo presentes
    for parity in parsed.parity:
        assert parity.selection_rates
        if parity.demographic_parity_difference is not None:
            assert 0 <= parity.demographic_parity_difference <= 1

    # Sugerencia de umbral: solo sugiere, no aplica (HU-19)
    ts = parsed.threshold_suggestion
    assert ts.current_threshold == 65
    assert 30 <= ts.suggested_threshold <= 90
    assert "bitácora" in ts.rationale

    # Notas: variables protegidas solo para auditoría
    assert any("SOLO como corte de auditoría" in n for n in parsed.notes)
    assert any("tipo_zona sí condiciona la red bayesiana" in n for n in parsed.notes)


def test_audit_endpoint_validates_sample_size(client: TestClient) -> None:
    """sample_size < 10 → 422 con validación de FastAPI."""
    response = client.get("/api/v1/ethics/audit", params={"sample_size": 5})
    assert response.status_code == 422


def test_audit_endpoint_503_when_data_missing(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, tmp_path
) -> None:
    """Sin split de prueba → 503 con mensaje amigable (HU-17)."""
    clear_cache()
    monkeypatch.setenv("DATA_DIR", str(tmp_path))  # directorio vacío
    response = client.get("/api/v1/ethics/audit", params={"sample_size": 60})
    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "test.csv" in detail
    assert "data/generate" in detail  # instrucción de recuperación
    monkeypatch.delenv("DATA_DIR")
    clear_cache()


def test_openapi_documents_ethics_audit(client: TestClient) -> None:
    """El OpenAPI describe GET /api/v1/ethics/audit con su DTO."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    assert "/api/v1/ethics/audit" in spec["paths"]
    get_op = spec["paths"]["/api/v1/ethics/audit"]["get"]
    assert (
        "EthicsAuditResponse"
        in get_op["responses"]["200"]["content"]["application/json"]["schema"]["$ref"]
    )
    assert "EthicsAuditResponse" in spec["components"]["schemas"]
