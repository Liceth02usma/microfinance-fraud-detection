"""Esquemas Pydantic para la regeneración del dataset sintético (HU-06..08)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class DatasetGenerateRequest(BaseModel):
    """Parámetros de regeneración del dataset sintético."""

    n_records: int = Field(
        default=15_000,
        ge=100,
        le=100_000,
        description="Número de registros sintéticos a generar",
    )
    fraud_rate: float = Field(
        default=0.035,
        gt=0.0,
        lt=0.2,
        description="Tasa de fraude real (2–5% recomendado, AGENTS.md)",
    )
    seed: int = Field(default=42, ge=0, description="Semilla determinista")


class DatasetGenerateResponse(BaseModel):
    """Rutas y metadatos del dataset regenerado."""

    main_path: str = Field(..., description="Dataset principal sintético")
    train_path: str = Field(..., description="Split de entrenamiento")
    val_path: str = Field(..., description="Split de validación")
    test_path: str = Field(..., description="Split de prueba")
    control_path: str = Field(..., description="Dataset de control sin sesgo rural")
    n_records: int = Field(..., ge=0, description="Registros generados")
    fraud_rate: float = Field(..., ge=0.0, le=1.0, description="Tasa de fraude usada")
    seed: int = Field(..., description="Semilla usada")
    warning: str = Field(
        ...,
        description=(
            "Advertencia: tras regenerar hay que reentrenar los modelos "
            "y recomputar la auditoría ética"
        ),
    )
