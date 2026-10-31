"""Configuración central de la aplicación.

Carga variables de entorno (CORS, entorno de ejecución) usando pydantic-settings.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Ajustes de la aplicación cargados desde variables de entorno o .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Nombre del entorno (dev, test, prod).
    app_env: str = "dev"
    # Orígenes permitidos por CORS (lista separada por comas).
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


def get_settings() -> Settings:
    """Devuelve una instancia cacheada de la configuración."""
    return Settings()
