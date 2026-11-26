"""Pruebas de valoraciones de clientes y sus PDF (HU-09, HU-26)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.versions import active_model_version
from app.reports.valuation_pdf import _rich

WEAK = [
    "sin_historial",
    "vive_lejos",
    "sin_local_fijo",
    "sin_fiador",
    "cedula_otra_region",
    "celular_prepago",
    "sin_cuenta_bancaria",
    "factura_manual",
    "fotos_poco_convincentes",
    "sin_referencias_comerciales",
    "nombre_distinto_recibo",
    "negocio_pequeno_monto",
    "direccion_sin_georreferenciar",
]


@pytest.fixture(autouse=True)
def _temp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Cada prueba usa su propia base SQLite temporal."""
    monkeypatch.setenv("VALUATIONS_DB", str(tmp_path / "valuations.sqlite3"))


def _solicitud(**overrides: object) -> dict:
    data: dict = {
        "id_solicitud": "SOL-T-0100",
        "tipo_zona": "rural",
        "oficina": "Corregimiento El Porvenir",
        "genero": "femenino",
        "pertenencia_etnica": "campesino",
        "producto_credito": "agropecuario",
        "tipo_negocio": "parcela_finca",
        "monto_solicitado": 5_000_000,
        "plazo_meses": 12,
        "ingresos_declarados": 1_500_000,
        "edad_solicitante": 40,
        "es_estacional": True,
    }
    for name in WEAK:
        data[name] = name in {"sin_historial", "celular_prepago"}
    data.update(overrides)
    return data


def _payload(decision: str = "aprobar", **solicitud: object) -> dict:
    return {
        "cliente_nombre": "María Pérez (sintético)",
        "cliente_documento": "CC-000123",
        "analista": "Analista de prueba",
        "decision": decision,
        "motivo": "Arraigo comunitario verificado en visita a la parcela.",
        "solicitud": _solicitud(**solicitud),
    }


def test_create_valuation_recomputes_result_on_server(client: TestClient) -> None:
    """La recomendación se calcula en el servidor y se guarda con trazabilidad."""
    response = client.post("/api/v1/valuations", json=_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["id"] >= 1
    assert body["resultado"]["semaforo"] == "verde"
    assert body["semaforo"] == "verde"
    assert body["sigue_recomendacion"] is True
    assert body["resultado"]["model_version"] == active_model_version()
    assert "fusion=" in body["version_sistema"] and "reglas=" in body["version_sistema"]


def test_decision_against_recommendation_is_flagged(client: TestClient) -> None:
    """Rechazar un caso verde queda marcado como desvío de la recomendación."""
    body = client.post("/api/v1/valuations", json=_payload(decision="rechazar")).json()
    assert body["sigue_recomendacion"] is False


def test_motivo_is_required(client: TestClient) -> None:
    """HU-26: sin motivo suficiente la valoración no se guarda (422)."""
    payload = _payload()
    payload["motivo"] = "corto"
    assert client.post("/api/v1/valuations", json=payload).status_code == 422


def test_list_search_and_detail(client: TestClient) -> None:
    """El historial lista lo más reciente primero y permite buscar."""
    client.post("/api/v1/valuations", json=_payload())
    second = _payload(decision="revision_comite", ingresos_inconsistentes=True)
    second["cliente_nombre"] = "Jorge Ruiz (sintético)"
    client.post("/api/v1/valuations", json=second)

    listing = client.get("/api/v1/valuations").json()
    assert listing["total"] == 2
    assert listing["items"][0]["cliente_nombre"].startswith("Jorge")
    assert listing["items"][0]["semaforo"] == "amarillo"

    found = client.get("/api/v1/valuations", params={"q": "María"}).json()
    assert found["total"] == 1

    detail = client.get(f"/api/v1/valuations/{listing['items'][0]['id']}")
    assert detail.status_code == 200
    assert detail.json()["solicitud"]["ingresos_inconsistentes"] is True


def test_missing_valuation_returns_404(client: TestClient) -> None:
    """Un id inexistente responde 404 en detalle y PDF."""
    assert client.get("/api/v1/valuations/999").status_code == 404
    assert client.get("/api/v1/valuations/999/pdf").status_code == 404


def test_single_and_report_pdf(client: TestClient) -> None:
    """Ambos PDF se descargan como application/pdf válidos."""
    created = client.post("/api/v1/valuations", json=_payload()).json()

    single = client.get(f"/api/v1/valuations/{created['id']}/pdf")
    assert single.status_code == 200
    assert single.headers["content-type"] == "application/pdf"
    assert single.content.startswith(b"%PDF")
    assert "attachment" in single.headers["content-disposition"]

    report = client.get("/api/v1/valuations/export/pdf")
    assert report.status_code == 200
    assert report.content.startswith(b"%PDF")


def test_empty_report_pdf(client: TestClient) -> None:
    """El reporte consolidado funciona aunque no haya valoraciones."""
    report = client.get("/api/v1/valuations/export/pdf")
    assert report.status_code == 200
    assert report.content.startswith(b"%PDF")


def test_rich_text_keeps_bold_and_escapes_html() -> None:
    """Los factores conservan las negritas y escapan cualquier otro HTML."""
    assert _rich("<strong>R-1</strong>: a < b") == "<b>R-1</b>: a &lt; b"
