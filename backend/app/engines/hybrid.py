"""Motor híbrido: fusión de reglas + bayesiano + ML en un puntaje 0-100 (HU-18, HU-19).

Estrategia: promedio ponderado lineal con pesos en `app/core/fusion.yaml`
(interpretable y auditables). Degradación: si un motor falla, se renormalizan
los pesos entre los disponibles y se reporta en `engine_status` (HU-18).

Garantías:
- Una señal débil aislada **jamás** llega a `rojo` (prueba automatizada HU-18):
  el subpuntaje de reglas está topado en casos rurales, la bayesiana apenas se
  mueve con señales débiles (CPDs≈ iguales fraude/no-fraude en rural) y el ML
  calibrado da probabilidades bajas sin indicios fuertes.
- El sistema **recomienda**; nunca ejecuta una decisión final (HU-09/HU-26).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pandas as pd
import yaml

from app.engines.bayesian import get_bayesian_engine, predict_bayesian_probability
from app.engines.rules import RulesResult, evaluate_rules
from app.schemas.evaluation import EvaluationRequest, Semaforo

FUSION_CONFIG_PATH = Path(__file__).resolve().parents[2] / "app" / "core" / "fusion.yaml"
MODELS_DIR = Path(__file__).resolve().parents[3] / "models"
ML_MODEL_PATH = MODELS_DIR / "main_gradient_boosting.joblib"


@dataclass
class FusionConfig:
    """Pesos de fusión y umbrales del semáforo cargados desde YAML."""

    weight_rules: float = 0.25
    weight_bayesian: float = 0.35
    weight_ml: float = 0.40
    verde_max: float = 20.0
    amarillo_max: float = 65.0
    # Pisos por nº de indicios fuertes activados: [(min_strong, semaforo)]
    strong_signal_floors: list[tuple[int, Semaforo]] = field(
        default_factory=lambda: [(1, Semaforo.AMARILLO), (2, Semaforo.ROJO)]
    )
    renormalize_weights: bool = True
    min_engines_required: int = 1
    version: str = "0.0.0"


@dataclass
class HybridResult:
    """Salida cruda de la fusión antes de convertirse en EvaluationResponse."""

    risk_score: float
    semaforo: Semaforo
    rules: RulesResult
    bayesian_probability: float | None
    ml_probability: float | None
    ml_factors: list[dict[str, Any]] = field(default_factory=list)
    # Contribuciones SHAP ampliadas (top 6) para el panel de razonamiento
    ml_contributions: list[dict[str, Any]] = field(default_factory=list)
    # Aportes a la fusión: (motor, peso efectivo, valor 0-1)
    fusion_parts: list[tuple[str, float, float]] = field(default_factory=list)
    strong_count: int = 0
    # Desglose prior × razones de verosimilitud de la red (None si no se pidió)
    bayesian_explanation: dict[str, Any] | None = None
    semaforo_by_score: Semaforo | None = None
    engines_ok: dict[str, bool] = field(default_factory=dict)
    missing_engines: list[str] = field(default_factory=list)
    fusion_version: str = "0.0.0"
    notes: list[str] = field(default_factory=list)


def load_fusion_config(path: Path | None = None) -> FusionConfig:
    """Carga `fusion.yaml` (pesos, umbrales, degradación)."""
    config_path = path or FUSION_CONFIG_PATH
    if not config_path.exists():
        return FusionConfig()
    data = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    fusion = data.get("fusion", {})
    weights = fusion.get("weights", {})
    thresholds = data.get("thresholds", {})
    degradation = data.get("degradation", {})
    floors_raw = thresholds.get("strong_signal_floors") or []
    floors: list[tuple[int, Semaforo]] = []
    for item in sorted(floors_raw, key=lambda x: int(x.get("min_strong", 0))):
        try:
            floors.append((int(item["min_strong"]), Semaforo(str(item["semaforo"]))))
        except (KeyError, ValueError):
            continue
    if not floors:
        floors = [(1, Semaforo.AMARILLO), (2, Semaforo.ROJO)]
    return FusionConfig(
        weight_rules=float(weights.get("rules", 0.25)),
        weight_bayesian=float(weights.get("bayesian", 0.35)),
        weight_ml=float(weights.get("ml", 0.40)),
        verde_max=float(thresholds.get("verde_max", 20)),
        amarillo_max=float(thresholds.get("amarillo_max", 65)),
        strong_signal_floors=floors,
        renormalize_weights=bool(degradation.get("renormalize_weights", True)),
        min_engines_required=int(degradation.get("min_engines_required", 1)),
        version=str(data.get("version", "0.0.0")),
    )


def classify(
    score: float,
    config: FusionConfig,
    strong_count: int = 0,
) -> Semaforo:
    """Convierte el puntaje 0-100 en semáforo según umbrales + pisos (HU-19).

    `strong_count` activa los `strong_signal_floors`: un indicio fuerte nunca
    queda verde y dos o más siempre escalan al comité de riesgo.
    """
    if score < config.verde_max:
        semaforo = Semaforo.VERDE
    elif score < config.amarillo_max:
        semaforo = Semaforo.AMARILLO
    else:
        semaforo = Semaforo.ROJO
    # Pisos: se eleva (nunca se degrada) el semáforo por indicios fuertes.
    order = [Semaforo.VERDE, Semaforo.AMARILLO, Semaforo.ROJO]
    for min_strong, floor in config.strong_signal_floors:
        if strong_count >= min_strong and order.index(floor) > order.index(semaforo):
            semaforo = floor
    return semaforo


def request_to_dataframe(request: EvaluationRequest) -> pd.DataFrame:
    """Convierte la solicitud en la fila de features que espera el ML."""
    row: dict[str, Any] = {
        "id_solicitud": request.id_solicitud,
        "tipo_zona": request.tipo_zona.value,
        "oficina": request.oficina,
        "genero": request.genero.value,
        "pertenencia_etnica": request.pertenencia_etnica.value,
        "producto_credito": request.producto_credito.value,
        "tipo_negocio": request.tipo_negocio.value,
        "monto_solicitado": request.monto_solicitado,
        "plazo_meses": request.plazo_meses,
        "ingresos_declarados": request.ingresos_declarados,
        "es_estacional": request.es_estacional,
        "antiguedad_negocio_meses": request.antiguedad_negocio_meses,
        "edad_solicitante": request.edad_solicitante,
    }
    weak_fields = [
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
    strong_fields = [
        "cedula_alterada",
        "ingresos_inconsistentes",
        "factura_falsa",
        "referencias_falsas",
        "historial_adverso",
        "negocio_inconsistente",
    ]
    for name in weak_fields + strong_fields:
        row[name] = bool(getattr(request, name))
    return pd.DataFrame([row])


class HybridEngine:
    """Ejecuta los tres motores, los fusiona y clasifica el riesgo."""

    def __init__(self, config: FusionConfig | None = None) -> None:
        """Carga la configuración de fusión y el modelo ML si existe."""
        self.config = config or load_fusion_config()
        self._ml_model: Any | None = None
        self._ml_error: str | None = None

    @property
    def ml_model(self) -> Any:
        """Carga perezosamente el XGBoost calibrado; None si no está disponible."""
        if self._ml_model is None and self._ml_error is None:
            try:
                from app.engines.ml_model import GradientBoostingModel

                if ML_MODEL_PATH.exists():
                    self._ml_model = GradientBoostingModel.load(ML_MODEL_PATH)
                else:
                    self._ml_error = f"Modelo ML no encontrado en {ML_MODEL_PATH}"
            except Exception as exc:  # noqa: BLE001 — degradación controlada
                self._ml_error = f"Modelo ML no cargable: {exc}"
        return self._ml_model

    def _evaluate_ml(
        self,
        request: EvaluationRequest,
        explain: bool = True,
    ) -> tuple[float | None, list[dict[str, Any]]]:
        """Probabilidad ML + factores SHAP; (None, []) si el motor falta.

        Con `explain=False` se omite SHAP (auditorías masivas, HU-21) y se
        devuelven 0 factores — el endpoint de evaluación individual sí lo pide.
        """
        model = self.ml_model
        if model is None:
            return None, []
        try:
            df = request_to_dataframe(request)
            proba = float(model.predict_proba(df)[0])
            factors = model.explain(df, top_k=6) if explain else []
            return proba, factors
        except Exception:  # noqa: BLE001 — degradación controlada
            return None, []

    def evaluate(self, request: EvaluationRequest, explain: bool = True) -> HybridResult:
        """Ejecuta reglas, bayesiano y ML, y fusiona el puntaje 0-100 (HU-18).

        `explain=False` omite el cálculo SHAP (para auditorías sobre lotes).
        """
        notes: list[str] = []
        engines_ok: dict[str, bool] = {}

        # 1) Motor de reglas (HU-11)
        try:
            rules_result = evaluate_rules(request)
            engines_ok["rules"] = True
        except Exception as exc:  # noqa: BLE001
            rules_result = RulesResult()
            engines_ok["rules"] = False
            notes.append(f"Motor de reglas no disponible: {exc}")

        # 2) Red bayesiana (HU-13)
        bayesian_probability: float | None
        bayesian_explanation: dict[str, Any] | None = None
        try:
            bayesian_probability = predict_bayesian_probability(request)
            engines_ok["bayesian"] = True
            if explain:
                bayesian_explanation = get_bayesian_engine().explain(
                    request, posterior=bayesian_probability
                )
        except Exception as exc:  # noqa: BLE001
            bayesian_probability = None
            engines_ok["bayesian"] = False
            notes.append(f"Red bayesiana no disponible: {exc}")

        # 3) Modelo ML + SHAP (HU-15, HU-20)
        ml_probability, ml_contributions = self._evaluate_ml(request, explain=explain)
        # Los factores explicativos usan el top 3 (HU-20); el razonamiento, el top 6.
        ml_factors = ml_contributions[:3]
        engines_ok["ml"] = ml_probability is not None
        if not engines_ok["ml"] and self._ml_error:
            notes.append(self._ml_error)

        # 4) Fusión con renormalización de pesos (HU-18)
        named: list[tuple[str, float, float]] = []  # (motor, peso, valor 0-1)
        if engines_ok["rules"]:
            named.append(("rules", self.config.weight_rules, rules_result.subscore))
        if engines_ok["bayesian"] and bayesian_probability is not None:
            named.append(("bayesian", self.config.weight_bayesian, bayesian_probability))
        if engines_ok["ml"] and ml_probability is not None:
            named.append(("ml", self.config.weight_ml, ml_probability))
        parts = [(w, v) for _, w, v in named]

        if not parts:
            raise RuntimeError("Ningún motor de evaluación está disponible; intente más tarde.")

        total_weight = sum(w for w, _ in parts)
        if total_weight <= 0:
            raise RuntimeError("Pesos de fusión inválidos en la configuración.")

        fused = sum(w * v for w, v in parts) / total_weight
        risk_score = round(max(0.0, min(100.0, fused * 100.0)), 2)
        strong_count = sum(
            1
            for f in (
                "cedula_alterada",
                "ingresos_inconsistentes",
                "factura_falsa",
                "referencias_falsas",
                "historial_adverso",
                "negocio_inconsistente",
            )
            if getattr(request, f)
        )
        semaforo = classify(risk_score, self.config, strong_count=strong_count)
        semaforo_by_score = classify(risk_score, self.config, strong_count=0)

        missing = [name for name, ok in engines_ok.items() if not ok]
        if missing and self.config.renormalize_weights:
            notes.append("Fusión renormalizada sin: " + ", ".join(missing) + ".")

        return HybridResult(
            risk_score=risk_score,
            semaforo=semaforo,
            rules=rules_result,
            bayesian_probability=bayesian_probability,
            ml_probability=ml_probability,
            ml_factors=ml_factors,
            ml_contributions=ml_contributions,
            fusion_parts=[(name, w / total_weight, v) for name, w, v in named],
            strong_count=strong_count,
            bayesian_explanation=bayesian_explanation,
            semaforo_by_score=semaforo_by_score,
            engines_ok=engines_ok,
            missing_engines=missing,
            fusion_version=self.config.version,
            notes=notes,
        )


_engine: HybridEngine | None = None


def get_hybrid_engine() -> HybridEngine:
    """Devuelve (creando si hace falta) la instancia singleton de la fusión."""
    global _engine
    if _engine is None:
        _engine = HybridEngine()
    return _engine


def build_explanatory_factors(
    request: EvaluationRequest,
    result: HybridResult,
    max_factors: int = 6,
) -> list[str]:
    """Combina reglas activadas, factores SHAP y contexto bayesiano (HU-20).

    Devuelve ≥ 3 factores en lenguaje claro, ordenados por peso/importancia,
    con contexto rural cuando aplica. La bayesiana se aporta como contexto
    numérico y las reglas + SHAP aportan los factores concretos.
    """
    scored: list[tuple[float, str]] = []

    # Reglas activadas ordenadas por peso absoluto
    for activation in result.rules.activated:
        text = f"<strong>{activation.id_regla}</strong>: {activation.justificacion}"
        scored.append((abs(activation.peso), text))

    # Factores SHAP del ML (ordenados ya por importancia)
    for factor in result.ml_factors:
        title = str(factor.get("title", ""))
        description = str(factor.get("description", ""))
        impact = str(factor.get("impact", ""))
        rural = (
            " (contexto rural típico, no implica fraude)" if factor.get("is_rural_context") else ""
        )
        text = f"<strong>{title}</strong>: {description}{rural} [{impact}]"
        scored.append((float(factor.get("abs_importance", 0.0)), text))

    # Contexto bayesiano
    if result.bayesian_probability is not None:
        pct = result.bayesian_probability * 100
        scored.append(
            (
                abs(result.bayesian_probability - 0.5),
                "<strong>Red bayesiana</strong>: "
                f"P(fraude | evidencia) = {pct:.2f}% según la red con CPDs "
                "estimadas del dataset (zona, actividad y señales).",
            )
        )

    # Contexto rural agregado (HU-18 / ética)
    weak_count = sum(
        1
        for name in [
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
        if getattr(request, name)
    )
    if request.tipo_zona.value == "rural" and weak_count > 0:
        scored.append(
            (
                0.01,
                f"<strong>Contexto rural</strong>: {weak_count} señal(es) débil(es) "
                "presente(s); frecuentes en productores sin acceso al sistema "
                "financiero formal y no determinan fraude por sí solas.",
            )
        )

    # Decisión humana (HU-09) — garantizada siempre en la respuesta
    human_oversight = (
        "<strong>Supervisión humana</strong>: el sistema recomienda; "
        "la decisión final corresponde al analista y queda registrada con "
        "motivo, usuario y versión del modelo."
    )

    scored.sort(key=lambda item: item[0], reverse=True)
    # Se reserva 1 cupo para el factor de supervisión humana (siempre presente)
    factors = [text for _, text in scored[: max(0, max_factors - 1)]]
    factors.append(human_oversight)

    # Garantía HU-20: mínimo 3 factores
    while len(factors) < 3:
        factors.insert(
            0,
            "<strong>Sin hallazgos adicionales</strong>: no se detectaron "
            "inconsistencias relevantes más allá de las señales observadas.",
        )
    return factors
