"""Endpoint de regeneración del dataset sintético (HU-06, HU-07, HU-08).

POST /api/v1/data/generate -> DatasetGenerateResponse

Genera, valida y particiona el dataset sintético determinista en `DATA_DIR`
(env) o en `<repo>/data`. Tras regenerar conviene reentrenar los modelos
(`uv run python -m app.engines.train_main_model`) y recomputar la auditoría
ética; el cache de auditoría se invalida automáticamente.
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.data.generate_dataset import generate_validate_and_split_datasets
from app.ethics.audit import DEFAULT_DATA_DIR, clear_cache
from app.schemas.data import DatasetGenerateRequest, DatasetGenerateResponse

router = APIRouter(tags=["data"])


def _output_dir() -> Path:
    """Directorio de datos: env `DATA_DIR` o `<repo>/data` (fuente única)."""
    env = os.environ.get("DATA_DIR")
    return Path(env) if env else DEFAULT_DATA_DIR


@router.post(
    "/data/generate",
    response_model=DatasetGenerateResponse,
    summary="Regenerar dataset sintético",
    description=(
        "Genera el dataset sintético determinista (semilla fija), lo valida "
        "contra el esquema, crea los splits estratificados por fraude y zona "
        "y el dataset de control sin sesgo rural. Tras regenerar debe "
        "reentrenarse el modelo y recalcularse la auditoría ética."
    ),
)
def generate_dataset(request: DatasetGenerateRequest) -> DatasetGenerateResponse:
    """Genera, valida y particiona el dataset sintético (HU-06..08)."""
    output_dir = _output_dir()
    try:
        main_path, train_path, val_path, test_path, control_path = (
            generate_validate_and_split_datasets(
                output_dir=output_dir,
                n_records=request.n_records,
                fraud_rate=request.fraud_rate,
                seed=request.seed,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"La generación falló la validación del dataset: {exc}",
        ) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo escribir el dataset en {output_dir}: {exc}",
        ) from exc

    # Los datos cambiaron: el cache de la auditoría ética ya no aplica (HU-21)
    clear_cache()

    return DatasetGenerateResponse(
        main_path=str(main_path),
        train_path=str(train_path),
        val_path=str(val_path),
        test_path=str(test_path),
        control_path=str(control_path),
        n_records=request.n_records,
        fraud_rate=request.fraud_rate,
        seed=request.seed,
        warning=(
            "Dataset regenerado: reentrene los modelos (train_baseline / "
            "train_main_model) y recalcule GET /api/v1/ethics/audit antes de "
            "usar estos datos para decisiones."
        ),
    )
