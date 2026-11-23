"""Fixtures de ejemplo para integración del contrato HU-17.

⚠️ Estos son ejemplos deterministas para validar el contrato, NO salidas
de motores reales (rules/bayesian/ml). La inferencia real es HU-18.
"""

from __future__ import annotations

from app.schemas.evaluation import (
    EngineState,
    EngineStatus,
    EvaluationResponse,
    RuleActivation,
    Semaforo,
)

# Ejemplo 1: rural legítimo con varias señales débiles -> verde/amarillo (nunca rojo)
EXAMPLE_RURAL_LEGIT = EvaluationResponse(
    risk_score=12.0,
    semaforo=Semaforo.VERDE,
    activated_rules=[],
    bayesian_probability=0.08,
    ml_probability=0.05,
    explanatory_factors=[
        "Caso rural con 8 señales débiles: frecuente en productores sin acceso "
        "al sistema financiero formal; no implica fraude (HU-18).",
        "Sin indicadores fuertes de fraude detectados.",
        "El sistema recomienda; la decisión final es del analista (HU-09).",
    ],
    model_version="0.1.0-baseline",
    engine_status=EngineStatus(rules=EngineState.OK, bayesian=EngineState.OK, ml=EngineState.OK),
)

# Ejemplo 2: urbano fraudulento con indicadores fuertes -> rojo
EXAMPLE_URBAN_FRAUD = EvaluationResponse(
    risk_score=95.0,
    semaforo=Semaforo.ROJO,
    activated_rules=[
        RuleActivation(
            id_regla="R-STRONG-CEDULA",
            peso=0.95,
            justificacion="Cédula con alteraciones detectadas",
        ),
        RuleActivation(
            id_regla="R-STRONG-FACTURA",
            peso=0.92,
            justificacion="Factura presenta indicios de falsedad",
        ),
    ],
    bayesian_probability=0.92,
    ml_probability=0.89,
    explanatory_factors=[
        "Se detectaron 6 indicador(es) fuerte(s) de fraude (HU-02).",
        "Cédula alterada y factura falsa son evidencia directa de fraude.",
        "El sistema recomienda rechazo; el comité humano confirma (HU-09).",
    ],
    model_version="0.1.0-baseline",
    engine_status=EngineStatus(rules=EngineState.OK, bayesian=EngineState.OK, ml=EngineState.OK),
)

# Ejemplo 3: caso ambiguo -> amarillo
EXAMPLE_AMBIGUOUS = EvaluationResponse(
    risk_score=45.0,
    semaforo=Semaforo.AMARILLO,
    activated_rules=[
        RuleActivation(
            id_regla="R-STRONG-INGRESOS",
            peso=0.90,
            justificacion="Ingresos declarados inconsistentes con el monto solicitado",
        ),
    ],
    bayesian_probability=0.45,
    ml_probability=0.38,
    explanatory_factors=[
        "Un indicador fuerte presente: ingresos inconsistentes.",
        "Se recomienda revisión manual por analista.",
        "El sistema recomienda; la decisión final es del analista (HU-09).",
    ],
    model_version="0.1.0-baseline",
    engine_status=EngineStatus(rules=EngineState.OK, bayesian=EngineState.OK, ml=EngineState.OK),
)
