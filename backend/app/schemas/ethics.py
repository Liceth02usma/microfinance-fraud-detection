"""Esquemas Pydantic para la auditoría ética y métricas de equidad (HU-04, HU-21)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GlobalMetrics(BaseModel):
    """Métricas globales de desempeño sobre el split de prueba."""

    n_samples: int = Field(..., description="Filas evaluadas")
    fraud_rate: float = Field(..., ge=0.0, le=1.0, description="Tasa real de fraude")
    auc: float | None = Field(None, ge=0.0, le=1.0, description="AUC-ROC (score continuo)")
    f1: float | None = Field(None, ge=0.0, le=1.0, description="F1 con umbral del semáforo")
    precision: float | None = Field(
        None, ge=0.0, le=1.0, description="Precisión (positivo = alerta roja)"
    )
    recall: float | None = Field(None, ge=0.0, le=1.0, description="Recall (positivo = rojo)")
    accuracy: float | None = Field(None, ge=0.0, le=1.0, description="Exactitud")
    alert_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Tasa de alertas rojas sobre el total"
    )


class GroupFPR(BaseModel):
    """FPR (y tasa de selección) de un grupo con intervalo de confianza."""

    attribute: str = Field(..., description="Variable protegida auditada")
    group: str = Field(..., description="Valor del grupo")
    n_samples: int = Field(..., ge=0, description="Muestras del grupo")
    n_actual_negative: int = Field(..., ge=0, description="No-fraudes reales (denominador del FPR)")
    n_false_positives: int = Field(..., ge=0, description="Falsos positivos del grupo")
    fpr: float | None = Field(
        None, ge=0.0, le=1.0, description="Tasa de falsos positivos; None si sin negativos"
    )
    fpr_ci_low: float | None = Field(
        None, ge=0.0, le=1.0, description="Límite inferior IC 95% (Wilson)"
    )
    fpr_ci_high: float | None = Field(
        None, ge=0.0, le=1.0, description="Límite superior IC 95% (Wilson)"
    )
    selection_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Proporción del grupo en alerta roja"
    )
    sample_size_warning: bool = Field(
        False, description="True si n < 30 (grupo pequeño: interpretar con IC)"
    )


class ParityMetrics(BaseModel):
    """Paridad demográfica y Equalized Odds para una variable protegida (HU-21)."""

    attribute: str = Field(..., description="Variable protegida")
    demographic_parity_difference: float | None = Field(
        None,
        ge=0.0,
        le=1.0,
        description="max selección − min selección entre grupos (0 = paridad perfecta)",
    )
    equalized_odds_difference: float | None = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Máx. diferencia de TPR/FPR entre grupos (0 = igualdad exacta)",
    )
    selection_rates: dict[str, float] = Field(
        default_factory=dict, description="Tasa de alerta por grupo"
    )
    fpr_ratio_max_min: float | None = Field(
        None,
        description="FPR_max/FPR_min entre grupos (meta cooperativa [0.80, 1.25] invertida)",
    )
    within_parity_band: bool | None = Field(
        None, description="True si todas las tasas caen en la banda [0.80, 1.25] relativa"
    )


class ThresholdSuggestion(BaseModel):
    """Ajuste equitativo de umbral sugerido (HU-19/HU-21) — no aplica automáticamente."""

    current_threshold: float = Field(..., description="Umbral rojo vigente (score 0-100)")
    suggested_threshold: float = Field(
        ..., description="Umbral que minimiza la brecha FPR rural-urbana"
    )
    fpr_gap_at_current: float | None = Field(
        None, description="|FPR_rural − FPR_urbano| con el umbral actual"
    )
    fpr_gap_at_suggested: float | None = Field(
        None, description="|FPR_rural − FPR_urbano| con el umbral sugerido"
    )
    recall_at_current: float | None = Field(None, description="Recall con umbral actual")
    recall_at_suggested: float | None = Field(None, description="Recall con umbral sugerido")
    rationale: str = Field(
        ..., description="Justificación en lenguaje claro; todo cambio requiere bitácora HU-19"
    )


class EthicsAuditResponse(BaseModel):
    """Reporte consolidado de auditoría ética (GET /api/v1/ethics/audit)."""

    generated_at: str = Field(..., description="Marca de tiempo ISO-8601 (UTC)")
    dataset_path: str = Field(..., description="Split evaluado")
    model_version: str = Field(..., description="Versión del modelo ML auditado")
    positive_class: str = Field("rojo", description="Clase positiva para las métricas: alerta roja")
    global_metrics: GlobalMetrics
    fpr_by_group: list[GroupFPR] = Field(
        default_factory=list, description="FPR por grupo de cada variable protegida"
    )
    parity: list[ParityMetrics] = Field(
        default_factory=list, description="Paridad demográfica y Equalized Odds por variable"
    )
    threshold_suggestion: ThresholdSuggestion
    notes: list[str] = Field(
        default_factory=list, description="Advertencias (grupos pequeños, datos faltantes)"
    )
