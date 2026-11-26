"""Endpoint de la base de conocimiento vigente (HU-10, HU-19, HU-24).

GET /api/v1/knowledge -> KnowledgeResponse

Expone las reglas cargadas por el motor, los pesos de fusión, los umbrales
del semáforo y la versión del modelo activo. La interfaz consume este
endpoint en lugar de mantener copias estáticas que pueden desalinearse.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.versions import active_model_version
from app.engines.hybrid import load_fusion_config
from app.engines.rules import RuleLoadError, get_engine
from app.schemas.knowledge import (
    FusionInfo,
    FusionWeights,
    KnowledgeResponse,
    KnowledgeRule,
    StrongFloor,
)

router = APIRouter(tags=["knowledge"])


@router.get(
    "/knowledge",
    response_model=KnowledgeResponse,
    summary="Base de conocimiento y configuración vigente",
    description=(
        "Reglas expertas cargadas desde knowledge/reglas.yaml, pesos de fusión, "
        "umbrales del semáforo y versión del modelo ML activo."
    ),
)
def knowledge() -> KnowledgeResponse:
    """Devuelve lo que el backend está ejecutando en este momento."""
    try:
        engine = get_engine()
        engine.reload()
    except RuleLoadError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    config = load_fusion_config()
    rules = [
        KnowledgeRule(
            id=str(rule["id"]),
            categoria=str(rule["categoria"]),
            senal=rule.get("senal"),
            condicion=str(rule["condicion"]),
            accion=str(rule["accion"]),
            peso=float(rule["peso"]),
            tope_rural=rule.get("tope_rural"),
            justificacion=str(rule["justificacion"]),
            fuente=str(rule["fuente"]),
            contexto_rural=(
                str(rule["contexto_rural"]).strip() if rule.get("contexto_rural") else None
            ),
        )
        for rule in engine.rules
    ]
    return KnowledgeResponse(
        rules_version=engine.version,
        rules=rules,
        fusion=FusionInfo(
            version=config.version,
            weights=FusionWeights(
                rules=config.weight_rules,
                bayesian=config.weight_bayesian,
                ml=config.weight_ml,
            ),
            verde_max=config.verde_max,
            amarillo_max=config.amarillo_max,
            strong_signal_floors=[
                StrongFloor(min_strong=n, semaforo=s.value) for n, s in config.strong_signal_floors
            ],
        ),
        model_version=active_model_version(),
    )
