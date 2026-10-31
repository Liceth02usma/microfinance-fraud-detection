"""Endpoint de salud del servicio.

GET /api/v1/health -> {"status": "ok", "env": <app_env>}
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health(settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str]:
    """Indica que el servicio está activo y devuelve el entorno actual."""
    return {"status": "ok", "env": settings.app_env}
