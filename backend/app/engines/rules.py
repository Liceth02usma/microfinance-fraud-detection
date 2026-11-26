"""Motor de reglas expertas con trazabilidad (HU-10, HU-11).

Carga las reglas desde `knowledge/reglas.yaml` (validadas contra
`knowledge/reglas.schema.json`) y las evalúa sobre una solicitud, devolviendo
las reglas activadas (ID, peso, justificación) y un subpuntaje entre 0 y 1.

Garantías de negocio:
- Señal débil aislada nunca produce un subpuntaje alto (HU-18): en casos
  rurales sin indicios fuertes el aporte de señales débiles queda topado por
  la salvaguarda R-SAFE-01 (`tope_rural`).
- El archivo de reglas se recarga automáticamente si cambia su mtime, sin
  reiniciar el código (HU-11).
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

from app.schemas.evaluation import EvaluationRequest, RuleActivation

# Ruta por defecto: <repo>/knowledge/reglas.yaml (backend/app/engines → 3 niveles arriba)
DEFAULT_RULES_PATH = Path(__file__).resolve().parents[3] / "knowledge" / "reglas.yaml"
DEFAULT_SCHEMA_PATH = Path(__file__).resolve().parents[3] / "knowledge" / "reglas.schema.json"

# Categorías que aportan al subpuntaje (bias tiene peso 0 y es solo auditoría)
SCORE_CATEGORIES = {"debil", "fuerte", "salvaguarda"}

# Acción de la salvaguarda R-SAFE-01: tope del subpuntaje de reglas en casos
# rurales sin indicios fuertes (HU-18 / AGENTS.md).
RURAL_CAP = 0.10

# Mapeo señal -> campo booleano del EvaluationRequest (WEAK_SIGNALS/STRONG_INDICATORS)
_SIGNAL_FIELDS: dict[str, str] = {
    # señales débiles
    "sin_historial": "sin_historial",
    "vive_lejos": "vive_lejos",
    "sin_local_fijo": "sin_local_fijo",
    "sin_fiador": "sin_fiador",
    "cedula_otra_region": "cedula_otra_region",
    "celular_prepago": "celular_prepago",
    "sin_cuenta_bancaria": "sin_cuenta_bancaria",
    "factura_manual": "factura_manual",
    "fotos_poco_convincentes": "fotos_poco_convincentes",
    "sin_referencias_comerciales": "sin_referencias_comerciales",
    "nombre_distinto_recibo": "nombre_distinto_recibo",
    "negocio_pequeno_monto": "negocio_pequeno_monto",
    "direccion_sin_georreferenciar": "direccion_sin_georreferenciar",
    # indicios fuertes
    "cedula_alterada": "cedula_alterada",
    "ingresos_inconsistentes": "ingresos_inconsistentes",
    "factura_falsa": "factura_falsa",
    "referencias_falsas": "referencias_falsas",
    "historial_adverso": "historial_adverso",
    "negocio_inconsistente": "negocio_inconsistente",
}

_STRONG_FIELDS = (
    "cedula_alterada",
    "ingresos_inconsistentes",
    "factura_falsa",
    "referencias_falsas",
    "historial_adverso",
    "negocio_inconsistente",
)


@dataclass
class RulesResult:
    """Salida del motor de reglas para una solicitud."""

    activated: list[RuleActivation] = field(default_factory=list)
    subscore: float = 0.0
    rules_version: str = "0.0.0"
    # Desglose para el panel de razonamiento (HU-20)
    strong_score: float = 0.0
    weak_score_raw: float = 0.0
    weak_score_applied: float = 0.0
    rural_cap_applied: bool = False


class RuleLoadError(Exception):
    """Error al cargar o validar la base de reglas."""


def _rules_path() -> Path:
    """Resuelve la ruta del archivo de reglas (env `RULES_PATH` tiene prioridad)."""
    env = os.environ.get("RULES_PATH")
    return Path(env) if env else DEFAULT_RULES_PATH


def load_rules(
    rules_path: Path | None = None,
    schema_path: Path | None = None,
) -> dict:
    """Carga y valida `reglas.yaml` contra el esquema JSON Schema (HU-10).

    Lanza `RuleLoadError` si el archivo no existe, no es YAML válido o no
    cumple el esquema.
    """
    path = rules_path or _rules_path()
    schema_file = schema_path or DEFAULT_SCHEMA_PATH

    if not path.exists():
        raise RuleLoadError(f"No se encontró el archivo de reglas: {path}")

    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        raise RuleLoadError(f"YAML inválido en {path}: {exc}") from exc

    if not isinstance(data, dict) or "reglas" not in data:
        raise RuleLoadError(f"Estructura inválida en {path}: falta la clave 'reglas'")

    if schema_file.exists():
        schema = json.loads(schema_file.read_text(encoding="utf-8"))
        validator = Draft202012Validator(schema)
        errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
        if errors:
            detail = "; ".join(
                f"{'/'.join(str(p) for p in err.path)}: {err.message}" for err in errors[:5]
            )
            raise RuleLoadError(f"Reglas inválidas contra el esquema: {detail}")

    return data


class RulesEngine:
    """Motor de reglas expertas con recarga automática y trazabilidad (HU-11)."""

    def __init__(self, rules_path: Path | None = None, schema_path: Path | None = None) -> None:
        """Inicializa el motor cargando las reglas desde disco."""
        self._rules_path = rules_path or _rules_path()
        self._schema_path = schema_path or DEFAULT_SCHEMA_PATH
        self._mtime: float | None = None
        self._data: dict = {"version": "0.0.0", "reglas": []}
        self.reload(force=True)

    def reload(self, force: bool = False) -> bool:
        """Recarga las reglas si el archivo cambió (mtime). Devuelve True si recargó.

        Un cambio en `knowledge/reglas.yaml` se aplica sin modificar ni
        reiniciar el código (HU-11).
        """
        if not self._rules_path.exists():
            if force:
                raise RuleLoadError(f"No se encontró el archivo de reglas: {self._rules_path}")
            return False

        mtime = self._rules_path.stat().st_mtime
        if not force and self._mtime is not None and mtime == self._mtime:
            return False

        self._data = load_rules(self._rules_path, self._schema_path)
        self._mtime = mtime
        return True

    @property
    def version(self) -> str:
        """Versión de la base de reglas cargada."""
        return str(self._data.get("version", "0.0.0"))

    @property
    def rules(self) -> list[dict]:
        """Lista cruda de reglas cargadas."""
        return list(self._data.get("reglas", []))

    def _condition_holds(self, rule: dict, request: EvaluationRequest) -> bool:
        """Evalúa la condición de una regla sobre la solicitud.

        Las condiciones se derivan de la categoría y la señal de la regla
        (estructura declarativa del YAML); las salvaguardas usan predicados
        fijos documentados en su `condicion`.
        """
        categoria = rule.get("categoria")
        senal = rule.get("senal")

        if categoria in ("debil", "fuerte") and senal:
            field_name = _SIGNAL_FIELDS.get(senal)
            if field_name is None:
                return False
            return bool(getattr(request, field_name, False))

        rule_id = rule.get("id", "")
        strong_count = sum(1 for f in _STRONG_FIELDS if getattr(request, f))

        if rule_id == "R-SAFE-01":
            # SI tipo_zona == rural Y indicios_fuertes == 0
            return request.tipo_zona.value == "rural" and strong_count == 0
        if rule_id == "R-SAFE-02":
            # SI es_estacional == true Y indicios_fuertes == 0
            return bool(request.es_estacional) and strong_count == 0
        if rule_id == "R-SAFE-03":
            # SI tipo_negocio IN (parcela_finca, plaza_mercado_feria) Y indicios_fuertes == 0
            return (
                request.tipo_negocio.value in ("parcela_finca", "plaza_mercado_feria")
                and strong_count == 0
            )
        if rule_id == "R-BIAS-01":
            # SI genero == femenino Y tipo_zona == rural (solo auditoría, peso 0)
            return request.genero.value == "femenino" and request.tipo_zona.value == "rural"
        if rule_id == "R-BIAS-02":
            # SI probabilidad_ml > 0.50 Y factores < 3 — se evalúa después de los
            # motores; en el motor de reglas no se activa (peso 0 igualmente).
            return False

        return False

    def evaluate(self, request: EvaluationRequest) -> RulesResult:
        """Evalúa la solicitud y devuelve reglas activadas + subpuntaje 0-1 (HU-11).

        Sin reglas activas devuelve subpuntaje 0 y lista vacía.
        """
        self.reload()  # aplica cambios de archivo sin reiniciar

        activated: list[RuleActivation] = []
        score = 0.0
        strong_count = sum(1 for f in _STRONG_FIELDS if getattr(request, f))
        rural_cap_applies = request.tipo_zona.value == "rural" and strong_count == 0
        weak_score = 0.0

        for rule in self.rules:
            if not self._condition_holds(rule, request):
                continue

            peso = float(rule.get("peso", 0.0))
            categoria = str(rule.get("categoria", ""))

            activated.append(
                RuleActivation(
                    id_regla=str(rule.get("id")),
                    peso=peso,
                    justificacion=str(rule.get("justificacion", "")).strip(),
                )
            )

            if categoria not in SCORE_CATEGORIES:
                continue  # reglas de auditoría (bias): trazables pero sin peso

            if categoria == "debil":
                weak_score += peso
            else:
                score += peso

        # Salvaguarda rural (HU-18): sin indicios fuertes el aporte de señales
        # débiles queda topado en RURAL_CAP para no castigar la ruralidad.
        weak_raw = weak_score
        if rural_cap_applies:
            weak_score = min(weak_score, RURAL_CAP)
        strong_score = score

        score = max(0.0, min(1.0, score + weak_score))

        return RulesResult(
            activated=activated,
            subscore=round(score, 4),
            rules_version=self.version,
            strong_score=round(strong_score, 4),
            weak_score_raw=round(weak_raw, 4),
            weak_score_applied=round(weak_score, 4),
            rural_cap_applied=rural_cap_applies and weak_raw > RURAL_CAP,
        )


# Instancia singleton reutilizada por el servicio de evaluación
_engine: RulesEngine | None = None


def get_engine() -> RulesEngine:
    """Devuelve (creando si hace falta) la instancia singleton del motor."""
    global _engine
    if _engine is None:
        _engine = RulesEngine()
    return _engine


def evaluate_rules(request: EvaluationRequest) -> RulesResult:
    """API funcional: evalúa una solicitud con la instancia singleton."""
    return get_engine().evaluate(request)
