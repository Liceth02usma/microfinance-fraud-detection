"""Pruebas del razonamiento por motor expuesto en /evaluate (HU-20)."""

from __future__ import annotations

import pytest

from app.engines.bayesian import get_bayesian_engine
from app.services.evaluation_service import evaluate_request
from tests.test_hybrid import _base_request


@pytest.mark.parametrize(
    "overrides",
    [{}, {"cedula_alterada": True}, {"celular_prepago": True, "sin_cuenta_bancaria": True}],
)
def test_bayesian_decomposition_matches_inference(overrides: dict[str, bool]) -> None:
    """prior × Π LR reproduce exactamente la posterior de pgmpy."""
    request = _base_request(**overrides)
    exp = get_bayesian_engine().explain(request)
    odds = exp["prior"] / (1 - exp["prior"])
    for item in exp["evidence"]:
        odds *= item["likelihood_ratio"]
    assert odds / (1 + odds) == pytest.approx(exp["posterior"], abs=1e-6)
    assert len(exp["evidence"]) == 19


def test_evaluate_exposes_reasoning_per_engine() -> None:
    """La respuesta incluye razonamiento de reglas, bayes, ML y fusión."""
    response = evaluate_request(_base_request(cedula_alterada=True))
    reasoning = response.reasoning
    assert reasoning is not None
    assert reasoning.rules is not None
    assert reasoning.rules.subscore == response.rules_subscore
    assert reasoning.bayesian is not None
    assert reasoning.bayesian.posterior == pytest.approx(response.bayesian_probability, abs=1e-4)
    strong = reasoning.bayesian.evidence[0]
    assert strong.variable == "cedula_alterada" and strong.likelihood_ratio > 10
    # Fusión: la suma de aportes reproduce el puntaje.
    total = sum(p.points for p in reasoning.fusion.parts)
    assert total == pytest.approx(response.risk_score, abs=0.05)
    assert sum(p.weight for p in reasoning.fusion.parts) == pytest.approx(1.0, abs=1e-3)
    if reasoning.ml is not None:
        assert len(reasoning.ml.contributions) >= 3


def test_rural_weak_signals_barely_move_bayes() -> None:
    """Ética: en zona rural las señales débiles tienen LR cercano a 1."""
    request = _base_request(tipo_zona="rural", celular_prepago=True, vive_lejos=True)
    exp = get_bayesian_engine().explain(request)
    weak = {e["variable"]: e["likelihood_ratio"] for e in exp["evidence"] if e["observed"]}
    assert 0.8 < weak["celular_prepago"] < 1.2
    assert 0.8 < weak["vive_lejos"] < 1.2


def test_floor_flag_when_strong_signal_raises_semaforo() -> None:
    """floor_applied indica si un piso por indicios fuertes elevó el semáforo."""
    response = evaluate_request(_base_request(cedula_alterada=True))
    fusion = response.reasoning.fusion  # type: ignore[union-attr]
    assert fusion.strong_count == 1
    assert fusion.floor_applied == (fusion.semaforo_by_score != response.semaforo)
