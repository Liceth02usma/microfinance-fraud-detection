"""Versiones activas de los artefactos del sistema (trazabilidad HU-09, HU-26).

La versión que se reporta en cada evaluación, auditoría o valoración debe ser
la del modelo que **realmente** se ejecutó, no un valor fijo en el código.
Se lee del archivo de métricas que acompaña al artefacto entrenado en
`models/`, de modo que reentrenar el modelo actualiza la versión reportada
sin tocar el código.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parents[3] / "models"
ML_METRICS_PATH = MODELS_DIR / "main_gradient_boosting_metrics.json"

# Valor de respaldo cuando el archivo de métricas no existe (p. ej. en un
# entorno recién clonado sin modelo entrenado): deja explícito que no hay
# versión verificable en lugar de inventar una.
UNKNOWN_MODEL_VERSION = "sin-modelo-entrenado"


@lru_cache(maxsize=1)
def active_model_version() -> str:
    """Versión del modelo ML principal según su archivo de métricas."""
    try:
        data = json.loads(ML_METRICS_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return UNKNOWN_MODEL_VERSION
    return str(data.get("model_version") or UNKNOWN_MODEL_VERSION)


def system_version(fusion_version: str, rules_version: str) -> str:
    """Versión compuesta modelo + fusión + reglas, para registros de auditoría."""
    return f"ml={active_model_version()}|fusion={fusion_version}|reglas={rules_version}"
