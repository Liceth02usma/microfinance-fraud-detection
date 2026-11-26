"""Endpoints de valoraciones de clientes (HU-09, HU-26).

POST /api/v1/valuations                -> guarda una valoración (recalcula la recomendación)
GET  /api/v1/valuations                -> historial (más reciente primero, filtro opcional)
GET  /api/v1/valuations/{id}           -> valoración completa
GET  /api/v1/valuations/{id}/pdf       -> ficha PDF de la valoración
GET  /api/v1/valuations/export/pdf     -> historial consolidado en PDF
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from app.core.versions import system_version
from app.engines.hybrid import get_hybrid_engine
from app.engines.rules import get_engine
from app.reports.valuation_pdf import render_valuation_pdf, render_valuations_report_pdf
from app.schemas.valuations import ValuationCreate, ValuationList, ValuationRecord
from app.services.evaluation_service import evaluate_request
from app.storage import valuations as store

router = APIRouter(tags=["valuations"])


def _pdf(content: bytes, filename: str) -> Response:
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/valuations",
    response_model=ValuationRecord,
    status_code=201,
    summary="Guardar valoración de un cliente",
    description=(
        "Recalcula la recomendación del sistema sobre la solicitud y la guarda "
        "junto con la decisión humana del analista y su motivo (HU-26)."
    ),
)
def create_valuation(payload: ValuationCreate) -> ValuationRecord:
    """Evalúa en el servidor y persiste la valoración con su trazabilidad."""
    try:
        resultado = evaluate_request(payload.solicitud)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    version = system_version(get_hybrid_engine().config.version, get_engine().version)
    return store.save_valuation(payload, resultado, version)


@router.get("/valuations", response_model=ValuationList, summary="Historial de valoraciones")
def list_valuations(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, max_length=80, description="Buscar por nombre/documento"),
) -> ValuationList:
    """Historial más reciente primero."""
    return store.list_valuations(limit=limit, offset=offset, query=q)


# Debe declararse antes de `/valuations/{valuation_id}` para no confundirse con un id.
@router.get(
    "/valuations/export/pdf",
    summary="Descargar historial en PDF",
    response_class=Response,
)
def export_valuations_pdf(
    q: str | None = Query(default=None, max_length=80),
) -> Response:
    """Historial consolidado (hasta 500 valoraciones) en un PDF."""
    return _pdf(render_valuations_report_pdf(store.all_records(query=q)), "valoraciones.pdf")


@router.get(
    "/valuations/{valuation_id}",
    response_model=ValuationRecord,
    summary="Detalle de una valoración",
)
def get_valuation(valuation_id: int) -> ValuationRecord:
    """Valoración completa o 404."""
    record = store.get_valuation(valuation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="La valoración no existe.")
    return record


@router.get(
    "/valuations/{valuation_id}/pdf",
    summary="Descargar valoración en PDF",
    response_class=Response,
)
def valuation_pdf(valuation_id: int) -> Response:
    """Ficha PDF de una valoración."""
    record = store.get_valuation(valuation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="La valoración no existe.")
    return _pdf(render_valuation_pdf(record), f"valoracion-{valuation_id}.pdf")
