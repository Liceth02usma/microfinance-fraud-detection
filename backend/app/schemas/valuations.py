"""Esquemas de las valoraciones de clientes (HU-09, HU-26).

Una valoración guarda la solicitud evaluada, la recomendación del sistema
(recalculada en el servidor, no copiada del cliente) y la **decisión humana**
del analista con su motivo. Así queda la trazabilidad que exige el manual de
gobierno: quién decidió, por qué, con qué recomendación y con qué versión.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.evaluation import EvaluationRequest, EvaluationResponse, Semaforo


class AnalystDecision(str, Enum):
    """Decisión final del analista (el sistema solo recomienda)."""

    APROBAR = "aprobar"
    REVISION_COMITE = "revision_comite"
    RECHAZAR = "rechazar"


# Decisión que corresponde a cada color del semáforo; sirve para marcar
# cuándo el analista se aparta de la recomendación (dato clave de auditoría).
RECOMMENDED_DECISION: dict[Semaforo, AnalystDecision] = {
    Semaforo.VERDE: AnalystDecision.APROBAR,
    Semaforo.AMARILLO: AnalystDecision.REVISION_COMITE,
    Semaforo.ROJO: AnalystDecision.RECHAZAR,
}


class ValuationCreate(BaseModel):
    """Datos que envía la interfaz para guardar una valoración."""

    cliente_nombre: str = Field(..., min_length=2, max_length=120, description="Nombre del cliente")
    cliente_documento: str = Field(
        ..., min_length=3, max_length=30, description="Documento o código del asociado"
    )
    analista: str = Field(..., min_length=2, max_length=80, description="Analista responsable")
    decision: AnalystDecision = Field(..., description="Decisión humana final")
    motivo: str = Field(
        ..., min_length=10, max_length=1000, description="Motivo de la decisión (obligatorio)"
    )
    observaciones: str | None = Field(None, max_length=2000, description="Notas adicionales")
    solicitud: EvaluationRequest = Field(..., description="Solicitud evaluada")


class ValuationSummary(BaseModel):
    """Fila del historial de valoraciones."""

    id: int
    created_at: str = Field(..., description="Fecha ISO 8601 (UTC)")
    cliente_nombre: str
    cliente_documento: str
    analista: str
    tipo_zona: str
    monto_solicitado: float
    risk_score: float
    semaforo: Semaforo
    decision: AnalystDecision
    sigue_recomendacion: bool = Field(
        ..., description="True si la decisión coincide con la recomendación del semáforo"
    )


class ValuationRecord(ValuationSummary):
    """Valoración completa, con solicitud, resultado y trazabilidad."""

    motivo: str
    observaciones: str | None = None
    solicitud: EvaluationRequest
    resultado: EvaluationResponse
    version_sistema: str = Field(..., description="Versiones de modelo, fusión y reglas")


class ValuationList(BaseModel):
    """Historial paginado de valoraciones."""

    total: int
    items: list[ValuationSummary]
