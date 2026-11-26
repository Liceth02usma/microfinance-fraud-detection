"""Pruebas del motor de reglas expertas (HU-10, HU-11) y del esquema (HU-10).

Incluye: validación de `knowledge/reglas.yaml` contra `reglas.schema.json`,
un caso que activa y uno que no activa por cada regla, tope rural (HU-18)
y recarga por mtime sin reiniciar código (HU-11).
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from app.engines.rules import (
    DEFAULT_RULES_PATH,
    DEFAULT_SCHEMA_PATH,
    RURAL_CAP,
    RuleLoadError,
    RulesEngine,
    evaluate_rules,
    load_rules,
)
from app.schemas.evaluation import EvaluationRequest

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
ALL_SIGNALS = WEAK_SIGNALS + STRONG_SIGNALS


def _base_request(**overrides: object) -> EvaluationRequest:
    """Solicitud limpia por defecto (rural, sin señales); acepta overrides."""
    data: dict = {
        "id_solicitud": "SOL-T-0001",
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
        "sin_historial": False,
        "vive_lejos": False,
        "sin_local_fijo": False,
        "sin_fiador": False,
        "cedula_otra_region": False,
        "celular_prepago": False,
        "sin_cuenta_bancaria": False,
        "factura_manual": False,
        "fotos_poco_convincentes": False,
        "sin_referencias_comerciales": False,
        "nombre_distinto_recibo": False,
        "negocio_pequeno_monto": False,
        "direccion_sin_georreferenciar": False,
    }
    data.update(overrides)
    return EvaluationRequest(**data)


def _activated_ids(result_ids: list[str], rule_id: str) -> bool:
    return rule_id in result_ids


# ── HU-10: esquema ────────────────────────────────────────────────────────────


def test_rules_yaml_exists_and_validates_against_schema() -> None:
    """HU-10: reglas.yaml existe y cumple reglas.schema.json."""
    assert DEFAULT_RULES_PATH.exists(), "knowledge/reglas.yaml debe existir"
    assert DEFAULT_SCHEMA_PATH.exists(), "knowledge/reglas.schema.json debe existir"
    data = load_rules(DEFAULT_RULES_PATH, DEFAULT_SCHEMA_PATH)
    assert 20 <= len(data["reglas"]) <= 30
    ids = [r["id"] for r in data["reglas"]]
    assert len(ids) == len(set(ids)), "IDs de reglas duplicados"


def test_every_weak_rule_has_rural_context_and_cap() -> None:
    """HU-10/HU-18: toda regla débil lleva contexto_rural y tope_rural."""
    data = load_rules()
    weak = [r for r in data["reglas"] if r["categoria"] == "debil"]
    assert len(weak) == 13
    for rule in weak:
        assert rule.get("contexto_rural"), f"{rule['id']} sin contexto_rural"
        assert "tope_rural" in rule, f"{rule['id']} sin tope_rural"
        assert 0 < rule["tope_rural"] <= 0.10


# ── HU-11: un caso que activa y uno que no, por regla ─────────────────────────


def _rule_by_id(rule_id: str) -> dict:
    data = load_rules()
    for rule in data["reglas"]:
        if rule["id"] == rule_id:
            return rule
    raise AssertionError(f"Regla {rule_id} no encontrada")


ALL_RULE_IDS = [r["id"] for r in load_rules()["reglas"]]


def _request_activating(rule_id: str) -> EvaluationRequest:
    """Construye una solicitud que activa la regla dada."""
    rule = _rule_by_id(rule_id)
    if rule["categoria"] == "debil":
        return _base_request(**{rule["senal"]: True})
    if rule["categoria"] == "fuerte":
        return _base_request(**{rule["senal"]: True})
    if rule_id == "R-SAFE-01":
        return _base_request(tipo_zona="rural")
    if rule_id == "R-SAFE-02":
        return _base_request(es_estacional=True)
    if rule_id == "R-SAFE-03":
        return _base_request(tipo_negocio="parcela_finca")
    if rule_id == "R-BIAS-01":
        return _base_request(genero="femenino", tipo_zona="rural")
    if rule_id == "R-BIAS-02":
        # Nunca activa en el motor de reglas (se evalúa con salida ML).
        return _base_request()
    raise AssertionError(f"Sin caso activador para {rule_id}")


def _request_not_activating(rule_id: str) -> EvaluationRequest:
    """Construye una solicitud que NO activa la regla dada."""
    rule = _rule_by_id(rule_id)
    if rule["categoria"] in ("debil", "fuerte"):
        return _base_request(**{rule["senal"]: False})
    if rule_id == "R-SAFE-01":
        return _base_request(tipo_zona="urbana")
    if rule_id == "R-SAFE-02":
        return _base_request(es_estacional=False)
    if rule_id == "R-SAFE-03":
        return _base_request(tipo_negocio="local_fijo")
    if rule_id == "R-BIAS-01":
        return _base_request(genero="masculino", tipo_zona="rural")
    if rule_id == "R-BIAS-02":
        return _base_request()
    raise AssertionError(f"Sin caso no-activador para {rule_id}")


@pytest.mark.parametrize("rule_id", ALL_RULE_IDS)
def test_rule_activates_when_condition_met(rule_id: str) -> None:
    """HU-11: caso que activa la regla."""
    result = evaluate_rules(_request_activating(rule_id))
    ids = [a.id_regla for a in result.activated]
    if rule_id == "R-BIAS-02":
        assert not _activated_ids(ids, rule_id)  # documentado: nunca activa aquí
        return
    assert _activated_ids(ids, rule_id), f"{rule_id} debió activarse"


@pytest.mark.parametrize("rule_id", ALL_RULE_IDS)
def test_rule_not_activated_when_condition_fails(rule_id: str) -> None:
    """HU-11: caso que NO activa la regla."""
    result = evaluate_rules(_request_not_activating(rule_id))
    ids = [a.id_regla for a in result.activated]
    assert not _activated_ids(ids, rule_id), f"{rule_id} no debió activarse"


# ── Subpuntaje y tope rural (HU-18) ──────────────────────────────────────────


def test_clean_request_has_zero_subscore() -> None:
    """HU-11: sin señales no hay aporte de riesgo (subpuntaje 0).

    En caso rural pueden activarse salvaguardas (peso ≤ 0) y reglas de
    auditoría; el subpuntaje final es 0 porque no hay señales de riesgo.
    """
    result = evaluate_rules(_base_request())
    assert result.subscore == 0.0
    scoring = [a for a in result.activated if a.peso > 0]
    assert scoring == []


def test_rural_cap_limits_weak_signals_subscore() -> None:
    """HU-18: 13 señales débiles rurales sin fuertes quedan topadas a 0.10."""
    overrides = {s: True for s in WEAK_SIGNALS}
    result = evaluate_rules(_base_request(**overrides))
    assert result.subscore <= RURAL_CAP + 1e-9
    # La activación es trazable aunque el aporte esté topado
    assert len([a for a in result.activated if a.id_regla.startswith("R-WEAK")]) == 13


def test_strong_signals_raise_subscore_above_weak_cap() -> None:
    """Un indicio fuerte aporta 0.40 (no aplica el tope rural)."""
    result = evaluate_rules(_base_request(cedula_alterada=True))
    assert result.subscore >= 0.40


def test_safeguards_activate_only_without_strong_signals() -> None:
    """R-SAFE-* exigen indicios_fuertes == 0 (no se bonifica un fraude)."""
    clean = evaluate_rules(_base_request())
    ids = [a.id_regla for a in clean.activated]
    assert "R-SAFE-01" in ids and "R-SAFE-02" in ids and "R-SAFE-03" in ids

    fraud = evaluate_rules(_base_request(cedula_alterada=True))
    fraud_ids = [a.id_regla for a in fraud.activated]
    assert "R-SAFE-01" not in fraud_ids
    assert "R-SAFE-02" not in fraud_ids
    assert "R-SAFE-03" not in fraud_ids


# ── HU-11: recarga sin reiniciar código ──────────────────────────────────────


def test_rules_reload_on_file_change(tmp_path: Path) -> None:
    """HU-11: cambiar el YAML se aplica por mtime sin reiniciar el proceso."""
    rules_file = tmp_path / "reglas_test.yaml"
    rules_file.write_text(DEFAULT_RULES_PATH.read_text(encoding="utf-8"), encoding="utf-8")
    engine = RulesEngine(rules_path=rules_file, schema_path=DEFAULT_SCHEMA_PATH)
    assert engine.version == load_rules()["version"]

    data = yaml.safe_load(rules_file.read_text(encoding="utf-8"))
    data["version"] = "9.9.9"
    rules_file.write_text(yaml.safe_dump(data, allow_unicode=True), encoding="utf-8")
    # fuerza mtime distinto (sistemas con resolución de 1s)
    import os

    os.utime(rules_file, (rules_file.stat().st_atime, rules_file.stat().st_mtime + 5))

    assert engine.reload() is True
    assert engine.version == "9.9.9"
    # sin cambios, no recarga
    assert engine.reload() is False


def test_invalid_rules_file_raises() -> None:
    """HU-10: archivo inexistente o inválido lanza RuleLoadError amigable."""
    with pytest.raises(RuleLoadError):
        load_rules(Path("/no/existe/reglas.yaml"))
