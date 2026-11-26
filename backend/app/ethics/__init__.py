"""Auditoría ética y métricas de equidad (HU-04, HU-21).

El reporte consolida FPR por grupo (zona, género, pertenencia étnica),
paridad demográfica, Equalized Odds con intervalos de confianza para
grupos pequeños y una sugerencia de ajuste de umbral que **no** se aplica
automáticamente (HU-19: todo cambio queda en la bitácora).
"""

from __future__ import annotations

from app.ethics.audit import run_audit

__all__ = ["run_audit"]
