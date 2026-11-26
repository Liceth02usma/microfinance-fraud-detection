"""Pruebas de la fusión híbrida (HU-18, HU-19, HU-27) y degradación.

Garantías cubiertas:
- HU-18: cada una de las 13 señales débiles presentada sola, en zona rural y
  urbana, jamás produce semáforo `rojo`.
- HU-27: los 3 casos de referencia (rural legítimo → verde/amarillo, urbano
  fraudulento → rojo, ambiguo → amarillo).
- HU-19: umbrales y pisos por indicios fuertes desde `app/core/fusion.yaml`.
- Degradación: motor ML ausente → fusión renormalizada y engine_status lo reporta.
"""

from __future__ import annotations

import pytest

from app.engines.hybrid import (
    HybridEngine,
    build_explanatory_factors,
    classify,
    get_hybrid_engine,
    load_fusion_config,
)
from app.schemas.evaluation import EvaluationRequest, Semaforo

WEAK_SIGNALS = [
    "sin_historial",
    "vive_lejos",
    "sin_local_fijo",
    "sin_fiador",
    "cedula_otra_region",
    "celular_prepago",
    "sin_cuenta_bancaria",
    "factura_manual",
    "fotos_poco_convincentes",
    "sin_referencias_comerciales",
    "nombre_distinto_recibo",
    "negocio_pequeno_monto",
    "direccion_sin_georreferenciar",
]
STRONG_SIGNALS = [
    "cedula_alterada",
    "ingresos_inconsistentes",
    "factura_falsa",
    "referencias_falsas",
    "historial_adverso",
    "negocio_inconsistente",
]


def _base_request(**overrides: object) -> EvaluationRequest:
    """Solicitud limpia por defecto (rural); acepta overrides."""
    data: dict = {
        "id_solicitud": "SOL-T-0002",
        "tipo_zona": "rural",
        "oficina": "Corregimiento El Porvenir",
        "genero": "femenino",
        "pertenencia_etnica": "campesino",
        "producto_credito": "agropecuario",
        "tipo_negocio": "parcela_finca",
        "monto_solicitado": 5_000_000,
        "plazo_meses": 12,
        "ingresos_declarados": 1_500_000,
        "edad_solicitante": 40,
        "es_estacional": True,
        "antiguedad_negocio_meses": 60,
    }
    for name in WEAK_SIGNALS + STRONG_SIGNALS:
        data[name] = False
    data.update(overrides)
    return EvaluationRequest(**data)


@pytest.fixture(scope="module")
def engine() -> HybridEngine:
    """Instancia singleton de la fusión (modelos ya entrenados en models/)."""
    return get_hybrid_engine()


# ── HU-18: señal débil aislada jamás rojo ─────────────────────────────────────


@pytest.mark.parametrize("zona", ["rural", "urbana"])
@pytest.mark.parametrize("signal", WEAK_SIGNALS)
def test_weak_signal_alone_never_rojo(engine: HybridEngine, zona: str, signal: str) -> None:
    """HU-18: una señal débil aislada nunca alcanza `rojo` (26 casos)."""
    overrides: dict = {signal: True, "tipo_zona": zona}
    if zona == "urbana":
        overrides.update(tipo_negocio="local_fijo", es_estacional=False)
    result = engine.evaluate(_base_request(**overrides))
    assert result.semaforo is not Semaforo.ROJO, (
        f"{signal} en {zona} produjo rojo con score {result.risk_score}"
    )
    assert result.risk_score < 20.0


def test_all_weak_signals_rural_never_rojo(engine: HybridEngine) -> None:
    """HU-18: las 13 señales débiles juntas en rural siguen sin llegar a rojo."""
    overrides = {s: True for s in WEAK_SIGNALS}
    result = engine.evaluate(_base_request(**overrides))
    assert result.semaforo is Semaforo.VERDE
    assert result.risk_score < 20.0


# ── HU-27: casos de referencia ───────────────────────────────────────────────


def test_reference_rural_legit_is_verde_or_amarillo(engine: HybridEngine) -> None:
    """HU-27 caso 1: rural legítimo con varias señales débiles → verde/amarillo."""
    request = _base_request(
        sin_historial=True,
        celular_prepago=True,
        sin_cuenta_bancaria=True,
        vive_lejos=True,
        direccion_sin_georreferenciar=True,
        sin_local_fijo=True,
        factura_manual=True,
    )
    result = engine.evaluate(request)
    assert result.semaforo in (Semaforo.VERDE, Semaforo.AMARILLO)
    factors = build_explanatory_factors(request, result)
    assert len(factors) >= 3  # HU-20


def test_reference_urban_fraud_is_rojo(engine: HybridEngine) -> None:
    """HU-27 caso 2: urbano fraudulento con indicios fuertes → rojo."""
    request = _base_request(
        tipo_zona="urbana",
        tipo_negocio="local_fijo",
        es_estacional=False,
        genero="masculino",
        pertenencia_etnica="ninguno",
        producto_credito="consumo",
        monto_solicitado=20_000_000,
        ingresos_declarados=100_000,
        cedula_alterada=True,
        ingresos_inconsistentes=True,
        factura_falsa=True,
        sin_fiador=True,
    )
    result = engine.evaluate(request)
    assert result.semaforo is Semaforo.ROJO
    assert result.risk_score >= 70


def test_reference_ambiguous_is_amarillo(engine: HybridEngine) -> None:
    """HU-27 caso 3: caso ambiguo (1 indicio fuerte + señales débiles) → amarillo."""
    request = _base_request(
        ingresos_inconsistentes=True,
        sin_historial=True,
        celular_prepago=True,
    )
    result = engine.evaluate(request)
    assert result.semaforo is Semaforo.AMARILLO


# ── HU-19: umbrales y pisos ──────────────────────────────────────────────────


def test_fusion_config_loads_weights_and_thresholds() -> None:
    """HU-19: pesos 0.25/0.35/0.40 y pisos por indicios fuertes desde YAML."""
    config = load_fusion_config()
    assert config.weight_rules == pytest.approx(0.25)
    assert config.weight_bayesian == pytest.approx(0.35)
    assert config.weight_ml == pytest.approx(0.40)
    assert config.verde_max == 20
    assert config.amarillo_max == 65
    assert (1, Semaforo.AMARILLO) in config.strong_signal_floors
    assert (2, Semaforo.ROJO) in config.strong_signal_floors


def test_one_strong_signal_never_verde_by_floor() -> None:
    """HU-19: 1 indicio fuerte activa el piso → nunca verde."""
    config = load_fusion_config()
    semaforo = classify(10.0, config, strong_count=1)
    assert semaforo is Semaforo.AMARILLO


def test_two_strong_signals_always_rojo_by_floor() -> None:
    """HU-19: 2 indicios fuertes activan el piso → siempre rojo."""
    config = load_fusion_config()
    semaforo = classify(30.0, config, strong_count=2)
    assert semaforo is Semaforo.ROJO


def test_score_thresholds_without_strong_signals() -> None:
    """HU-19: sin indicios fuertes solo mandan los umbrales de puntaje."""
    config = load_fusion_config()
    assert classify(19.99, config, strong_count=0) is Semaforo.VERDE
    assert classify(20.0, config, strong_count=0) is Semaforo.AMARILLO
    assert classify(64.99, config, strong_count=0) is Semaforo.AMARILLO
    assert classify(65.0, config, strong_count=0) is Semaforo.ROJO


# ── Degradación (HU-18) ──────────────────────────────────────────────────────


def test_degrades_when_ml_missing() -> None:
    """Sin modelo ML: fusión renormalizada y engine_status lo reporta."""
    broken = HybridEngine()
    # Marcar error previo impide el intento de carga (property ml_model)
    broken._ml_error = "modelo no disponible en test"  # noqa: SLF001 — forzar fallo
    broken._ml_model = None  # noqa: SLF001

    result = broken.evaluate(_base_request(cedula_alterada=True))
    assert result.engines_ok["rules"] is True
    assert result.engines_ok["bayesian"] is True
    assert result.engines_ok["ml"] is False
    assert "ml" in result.missing_engines
    assert any("renormalizada" in n for n in result.notes)
    # Con 1 indicio fuerte el piso lo mantiene en amarillo aunque falte el ML
    assert result.semaforo is Semaforo.AMARILLO


def test_degrades_when_rules_missing() -> None:
    """Sin motor de reglas: la bayesiana + ML sostienen la respuesta."""
    broken = HybridEngine()

    # monkeypatch evaluate_rules para fallar
    import app.engines.hybrid as hybrid_mod

    original = hybrid_mod.evaluate_rules

    def _boom(request: EvaluationRequest) -> object:
        raise RuntimeError("reglas caídas (test)")

    hybrid_mod.evaluate_rules = _boom  # type: ignore[assignment]
    try:
        result = broken.evaluate(_base_request(cedula_alterada=True))
    finally:
        hybrid_mod.evaluate_rules = original  # type: ignore[assignment]

    assert result.engines_ok["rules"] is False
    assert result.engines_ok["bayesian"] is True
    assert "rules" in result.missing_engines
    assert result.semaforo is not Semaforo.VERDE  # piso por indicio fuerte


def test_explanatory_factors_min_three(engine: HybridEngine) -> None:
    """HU-20: siempre ≥3 factores explicativos en lenguaje claro."""
    request = _base_request(vive_lejos=True, celular_prepago=True)
    result = engine.evaluate(request)
    factors = build_explanatory_factors(request, result)
    assert len(factors) >= 3
    assert any("Supervisión humana" in f for f in factors)  # supervisión humana presente
    assert not any("HU-" in f for f in factors)  # sin referencias internas
