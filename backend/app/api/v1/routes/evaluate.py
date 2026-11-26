"""Endpoint de evaluación de solicitudes de crédito (HU-17).

POST /api/v1/evaluate -> EvaluationResponse

La API recomienda; no toma decisiones crediticias automáticas (HU-09, HU-26).
"""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas.evaluation import EvaluationRequest, EvaluationResponse
from app.services.evaluation_service import evaluate_request

router = APIRouter(tags=["evaluation"])


@router.post(
    "/evaluate",
    response_model=EvaluationResponse,
    summary="Evaluar solicitud de crédito",
    description=(
        "Evalúa una solicitud con el motor híbrido (reglas + red bayesiana + "
        "XGBoost) y devuelve puntaje de riesgo, semáforo, reglas activadas, "
        "probabilidades y factores explicativos. Los pesos de fusión y "
        "umbrales viven en app/core/fusion.yaml (HU-18/HU-19). Si un motor "
        "falta, se renormalizan los pesos y se reporta en engine_status "
        "(HU-18). El sistema recomienda; la decisión final es del analista "
        "(HU-09)."
    ),
)
def evaluate(request: EvaluationRequest) -> EvaluationResponse:
    """Evalúa una solicitud de crédito y devuelve el contrato unificado."""
    return evaluate_request(request)
