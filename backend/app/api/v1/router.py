"""Agrega todos los routers de la versión 1 de la API."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes import health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
