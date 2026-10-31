"""Fixtures compartidas de pytest."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    """Cliente de pruebas para la API FastAPI."""
    return TestClient(app)
