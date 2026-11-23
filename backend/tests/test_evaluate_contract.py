"""Pruebas del contrato de POST /api/v1/evaluate (HU-17).

Valida esquema válido/inválido, campos de respuesta, rangos y OpenAPI.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.schemas.evaluation import EvaluationRequest, EvaluationResponse


def _valid_request_payload() -> dict:
    """Payload válido de ejemplo: caso rural legítimo con varias señales débiles."""
    return {
        "id_solicitud": "SOL-0001-000001",
        "tipo_zona": "rural",
        "oficina": "Corregimiento El Porvenir",
        "genero": "femenino",
        "pertenencia_etnica": "campesino",
        "producto_credito": "agropecuario",
        "tipo_negocio": "parcela_finca",
        "monto_solicitado": 8_000_000,
        "plazo_meses": 24,
        "ingresos_declarados": 4_000_000,
        "edad_solicitante": 45,
        "es_estacional": True,
        "sin_historial": True,
        "vive_lejos": True,
        "sin_local_fijo": True,
        "sin_fiador": True,
        "cedula_otra_region": True,
        "celular_prepago": True,
        "sin_cuenta_bancaria": True,
        "factura_manual": True,
        "fotos_poco_convincentes": False,
        "sin_referencias_comerciales": False,
        "nombre_distinto_recibo": False,
        "negocio_pequeno_monto": False,
        "direccion_sin_georreferenciar": False,
        "cedula_alterada": False,
        "ingresos_inconsistentes": False,
        "factura_falsa": False,
        "referencias_falsas": False,
        "historial_adverso": False,
        "negocio_inconsistente": False,
        "modelo_version": "0.1.0-baseline",
        "fuente_datos": "test",
    }


def test_evaluate_endpoint_returns_200_and_contract(client: TestClient) -> None:
    """El endpoint responde 200 y cumple el contrato de respuesta."""
    response = client.post("/api/v1/evaluate", json=_valid_request_payload())
    assert response.status_code == 200
    data = response.json()

    # Validar contra el esquema Pydantic de respuesta
    parsed = EvaluationResponse(**data)

    assert 0 <= parsed.risk_score <= 100
    assert parsed.semaforo.value in ("verde", "amarillo", "rojo")
    assert isinstance(parsed.activated_rules, list)
    assert 0.0 <= parsed.bayesian_probability <= 1.0
    assert 0.0 <= parsed.ml_probability <= 1.0
    assert len(parsed.explanatory_factors) >= 3
    assert parsed.model_version == "0.1.0-baseline"
    assert parsed.engine_status is not None
    # HU-17: el contrato exige declarar el estado de cada motor. Hoy ninguno está
    # conectado (la fusión real es HU-18), así que se reportan como `missing`
    # en lugar de fingir disponibilidad.
    assert parsed.engine_status.rules.value == "missing"
    assert parsed.engine_status.bayesian.value == "missing"
    assert parsed.engine_status.ml.value == "missing"


def test_rural_legitimate_never_rojo(client: TestClient) -> None:
    """HU-18: caso rural legítimo con varias señales débiles nunca es rojo."""
    response = client.post("/api/v1/evaluate", json=_valid_request_payload())
    assert response.status_code == 200
    data = response.json()
    assert data["semaforo"] != "rojo"
    assert data["semaforo"] in ("verde", "amarillo")


def test_urban_fraudulent_is_rojo(client: TestClient) -> None:
    """Caso urbano fraudulento con indicadores fuertes -> rojo."""
    payload = _valid_request_payload()
    payload.update(
        {
            "id_solicitud": "SOL-0003-000001",
            "tipo_zona": "urbana",
            "oficina": "Oficina Central San Juan",
            "genero": "masculino",
            "pertenencia_etnica": "ninguno",
            "producto_credito": "consumo",
            "tipo_negocio": "local_fijo",
            "monto_solicitado": 20_000_000,
            "ingresos_declarados": 100_000,
            "edad_solicitante": 40,
            "es_estacional": False,
            "cedula_alterada": True,
            "ingresos_inconsistentes": True,
            "factura_falsa": True,
            "referencias_falsas": True,
            "historial_adverso": True,
            "negocio_inconsistente": True,
        }
    )
    response = client.post("/api/v1/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["semaforo"] == "rojo"
    assert data["risk_score"] >= 70


def test_invalid_payload_returns_422(client: TestClient) -> None:
    """Payload inválido (tipo_zona incorrecto) -> 422."""
    payload = _valid_request_payload()
    payload["tipo_zona"] = "invalid_zone"
    response = client.post("/api/v1/evaluate", json=payload)
    assert response.status_code == 422


def test_missing_required_field_returns_422(client: TestClient) -> None:
    """Falta un campo obligatorio -> 422."""
    payload = _valid_request_payload()
    del payload["monto_solicitado"]
    response = client.post("/api/v1/evaluate", json=payload)
    assert response.status_code == 422


def test_out_of_range_monto_returns_422(client: TestClient) -> None:
    """Monto fuera de rango -> 422."""
    payload = _valid_request_payload()
    payload["monto_solicitado"] = 500  # menor que el mínimo 1_000_000
    response = client.post("/api/v1/evaluate", json=payload)
    assert response.status_code == 422


def test_request_schema_validation_directly() -> None:
    """El esquema Pydantic valida directamente."""
    payload = _valid_request_payload()
    req = EvaluationRequest(**payload)
    assert req.tipo_zona.value == "rural"

    with pytest.raises(ValidationError):
        bad = dict(payload)
        bad["tipo_zona"] = "espacial"
        EvaluationRequest(**bad)


def test_openapi_describes_evaluate_endpoint(client: TestClient) -> None:
    """El OpenAPI generado describe POST /api/v1/evaluate con los DTO correctos."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()

    assert "/api/v1/evaluate" in spec["paths"]
    post_op = spec["paths"]["/api/v1/evaluate"]["post"]
    assert (
        "EvaluationRequest"
        in post_op["requestBody"]["content"]["application/json"]["schema"]["$ref"]
    )
    assert (
        "EvaluationResponse"
        in post_op["responses"]["200"]["content"]["application/json"]["schema"]["$ref"]
    )

    # Verificar que los esquemas existen en components
    schemas = spec["components"]["schemas"]
    assert "EvaluationRequest" in schemas
    assert "EvaluationResponse" in schemas
    assert "RuleActivation" in schemas

    # Verificar nombre de campo semaforo (sin tilde) en el esquema
    response_props = schemas["EvaluationResponse"]["properties"]
    assert "semaforo" in response_props
    assert "semáforo" not in response_props


def test_docs_endpoint_available(client: TestClient) -> None:
    """Swagger UI disponible en /docs."""
    response = client.get("/docs")
    assert response.status_code == 200
