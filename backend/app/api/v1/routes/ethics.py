"""Endpoint de auditoría ética y métricas de equidad (HU-21).

GET /api/v1/ethics/audit -> EthicsAuditResponse

Reporta FPR por grupo (zona, género, pertenencia étnica) con IC 95%,
paridad demográfica + Equalized Odds (fairlearn), métricas globales
(AUC, F1, Precisión, Recall) y una sugerencia de umbral que no se aplica
automáticamente (HU-19).
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.ethics.audit import AuditDataError, run_audit
from app.schemas.ethics import EthicsAuditResponse

router = APIRouter(tags=["ethics"])


@router.get(
    "/ethics/audit",
    response_model=EthicsAuditResponse,
    summary="Auditoría ética y métricas de equidad",
    description=(
        "Consolida FPR por grupo con intervalos de confianza de Wilson, "
        "paridad demográfica y Equalized Odds sobre el split de prueba, "
        "métricas globales del modelo (AUC, F1, Precisión, Recall) y una "
        "sugerencia de ajuste de umbral (solo sugerencia: aplicarla exige "
        "bitácora HU-19). Las variables protegidas se usan únicamente como "
        "corte de auditoría, nunca como predictores (HU-04)."
    ),
)
def ethics_audit(
    sample_size: int | None = Query(
        default=None,
        ge=10,
        le=100_000,
        description="Tamaño opcional de muestra estratificada (para pruebas rápidas)",
    ),
) -> EthicsAuditResponse:
    """Devuelve el reporte consolidado de auditoría ética (HU-21)."""
    try:
        return run_audit(sample_size=sample_size)
    except AuditDataError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
