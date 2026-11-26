"""Agrega todos los routers de la versión 1 de la API."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes import data, ethics, evaluate, health, knowledge, valuations

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(evaluate.router)
api_router.include_router(ethics.router)
api_router.include_router(data.router)
api_router.include_router(knowledge.router)
api_router.include_router(valuations.router)
