"""Servicio de evaluación híbrida (HU-17, HU-18, HU-20).

Conecta el contrato HTTP con el motor de fusión real (`app/engines/hybrid.py`):
reglas + red bayesiana + XGBoost calibrado, umbrales y pisos desde
`app/core/fusion.yaml`. Si un motor falta, se renormalizan los pesos y el
estado se reporta en `engine_status` (HU-18).

El sistema **recomienda**; la decisión final es del analista humano (HU-09).
"""

from __future__ import annotations

from app.core.versions import active_model_version
from app.engines.hybrid import HybridResult, build_explanatory_factors, get_hybrid_engine
from app.engines.rules import RURAL_CAP
from app.schemas.evaluation import (
    BayesianEvidence,
    BayesianReasoning,
    EngineReasoning,
    EngineState,
    EngineStatus,
    EvaluationRequest,
    EvaluationResponse,
    FusionPart,
    FusionReasoning,
    MlReasoning,
    RulesReasoning,
    Semaforo,
    ShapContribution,
)


def build_reasoning(result: HybridResult, verde_max: float, amarillo_max: float) -> EngineReasoning:
    """Arma el razonamiento por motor que muestra la UI (HU-20).

    Cada bloque es `None` si su motor no estuvo disponible: la interfaz
    informa la ausencia en lugar de inventar un desglose.
    """
    rules = None
    if result.engines_ok.get("rules"):
        r = result.rules
        rules = RulesReasoning(
            strong_score=r.strong_score,
            weak_score_raw=r.weak_score_raw,
            weak_score_applied=r.weak_score_applied,
            rural_cap=RURAL_CAP,
            rural_cap_applied=r.rural_cap_applied,
            subscore=round(r.subscore, 4),
        )

    bayesian = None
    exp = result.bayesian_explanation
    if result.engines_ok.get("bayesian") and exp is not None:
        bayesian = BayesianReasoning(
            prior=round(float(exp["prior"]), 4),
            posterior=round(float(exp["posterior"]), 4),
            evidence=[
                BayesianEvidence(
                    variable=str(e["variable"]),
                    observed=bool(e["observed"]),
                    kind=str(e["kind"]),
                    likelihood_ratio=round(float(e["likelihood_ratio"]), 4),
                )
                for e in exp["evidence"]
            ],
        )

    ml = None
    if result.engines_ok.get("ml") and result.ml_probability is not None:
        ml = MlReasoning(
            probability=round(result.ml_probability, 4),
            contributions=[
                ShapContribution(
                    feature=str(c.get("feature", "")),
                    title=str(c.get("title", "")),
                    shap_value=float(c.get("shap_value", 0.0)),
                    is_rural_context=bool(c.get("is_rural_context", False)),
                )
                for c in result.ml_contributions
            ],
        )

    by_score = result.semaforo_by_score or result.semaforo
    fusion = FusionReasoning(
        parts=[
            FusionPart(
                engine=name,
                weight=round(weight, 4),
                value=round(min(1.0, max(0.0, value)), 4),
                points=round(weight * value * 100, 2),
            )
            for name, weight, value in result.fusion_parts
        ],
        verde_max=verde_max,
        amarillo_max=amarillo_max,
        strong_count=result.strong_count,
        semaforo_by_score=by_score,
        floor_applied=by_score != result.semaforo,
        fusion_version=result.fusion_version,
    )
    return EngineReasoning(rules=rules, bayesian=bayesian, ml=ml, fusion=fusion)


def evaluate_request(request: EvaluationRequest) -> EvaluationResponse:
    """Evalúa una solicitud con la fusión híbrida real y arma la respuesta.

    Lanza `RuntimeError` (→ HTTP 503) si ningún motor está disponible; los
    fallos individuales se degradan y se reportan en `engine_status`.
    """
    engine = get_hybrid_engine()
    result = engine.evaluate(request)

    def _state(ok: bool) -> EngineState:
        return EngineState.OK if ok else EngineState.MISSING

    # Contrato HU-17 exige números; si el motor falta se reporta 0.0 junto
    # con engine_status = "missing" (la UI muestra el estado).
    bayesian_probability = (
        round(result.bayesian_probability, 4) if result.bayesian_probability is not None else 0.0
    )
    ml_probability = round(result.ml_probability, 4) if result.ml_probability is not None else 0.0

    return EvaluationResponse(
        risk_score=result.risk_score,
        semaforo=result.semaforo if isinstance(result.semaforo, Semaforo) else Semaforo.VERDE,
        activated_rules=result.rules.activated,
        bayesian_probability=bayesian_probability,
        ml_probability=ml_probability,
        rules_subscore=round(result.rules.subscore, 4),
        explanatory_factors=build_explanatory_factors(request, result),
        # Se reporta la versión del modelo que realmente se ejecutó (leída del
        # artefacto en models/), no la que declare el cliente (HU-26).
        model_version=active_model_version(),
        engine_status=EngineStatus(
            rules=_state(result.engines_ok.get("rules", False)),
            bayesian=_state(result.engines_ok.get("bayesian", False)),
            ml=_state(result.engines_ok.get("ml", False)),
        ),
        reasoning=build_reasoning(result, engine.config.verde_max, engine.config.amarillo_max),
    )
