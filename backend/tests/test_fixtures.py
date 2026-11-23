"""Valida que los fixtures de ejemplo cumplan los esquemas del contrato (HU-17)."""

from __future__ import annotations

from app.schemas.evaluation import EvaluationResponse

from .fixtures import EXAMPLE_AMBIGUOUS, EXAMPLE_RURAL_LEGIT, EXAMPLE_URBAN_FRAUD


def test_fixture_rural_legit_validates() -> None:
    """El fixture rural legítimo valida contra EvaluationResponse."""
    data = EXAMPLE_RURAL_LEGIT.model_dump()
    parsed = EvaluationResponse(**data)
    assert parsed.semaforo.value != "rojo"
    assert len(parsed.explanatory_factors) >= 3


def test_fixture_urban_fraud_validates() -> None:
    """El fixture urbano fraudulento valida y es rojo."""
    data = EXAMPLE_URBAN_FRAUD.model_dump()
    parsed = EvaluationResponse(**data)
    assert parsed.semaforo.value == "rojo"
    assert parsed.risk_score >= 70


def test_fixture_ambiguous_validates() -> None:
    """El fixture ambiguo valida y es amarillo."""
    data = EXAMPLE_AMBIGUOUS.model_dump()
    parsed = EvaluationResponse(**data)
    assert parsed.semaforo.value == "amarillo"
