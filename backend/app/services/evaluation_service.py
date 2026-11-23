"""Servicio de evaluación híbrida (HU-17).

⚠️ NOTA: Este módulo devuelve EJEMPLOS/fixtures deterministas para integración
de contrato. NO es una inferencia real de los motores (eso es HU-18).
La lógica de fusión real vive en `app/engines/hybrid.py` (pendiente).
"""

from __future__ import annotations

from app.schemas.evaluation import (
    EngineState,
    EngineStatus,
    EvaluationRequest,
    EvaluationResponse,
    RuleActivation,
    Semaforo,
)

# Versión del contrato de ejemplos. Coincide con el default del request.
EXAMPLE_MODEL_VERSION = "0.1.0-baseline"


def _example_rules(request: EvaluationRequest) -> list[RuleActivation]:
    """Devuelve reglas de ejemplo activadas según los indicadores fuertes presentes."""
    strong_map = {
        "cedula_alterada": ("R-STRONG-CEDULA", 0.95, "Cédula con alteraciones detectadas"),
        "ingresos_inconsistentes": (
            "R-STRONG-INGRESOS",
            0.90,
            "Ingresos declarados inconsistentes con el monto solicitado",
        ),
        "factura_falsa": ("R-STRONG-FACTURA", 0.92, "Factura presenta indicios de falsedad"),
        "referencias_falsas": (
            "R-STRONG-REFERENCIAS",
            0.88,
            "Referencias comerciales no verificables",
        ),
        "historial_adverso": (
            "R-STRONG-HISTORIAL",
            0.85,
            "Historial crediticio adverso en centrales de riesgo",
        ),
        "negocio_inconsistente": (
            "R-STRONG-NEGOCIO",
            0.87,
            "Negocio declarado inconsistente con la evidencia recolectada",
        ),
    }
    activated: list[RuleActivation] = []
    for field, (rule_id, peso, just) in strong_map.items():
        if getattr(request, field):
            activated.append(RuleActivation(id_regla=rule_id, peso=peso, justificacion=just))
    return activated


def _example_explanatory_factors(request: EvaluationRequest) -> list[str]:
    """Genera al menos 3 factores explicativos en lenguaje claro (HU-20)."""
    factors: list[str] = []
    strong_count = sum(
        [
            request.cedula_alterada,
            request.ingresos_inconsistentes,
            request.factura_falsa,
            request.referencias_falsas,
            request.historial_adverso,
            request.negocio_inconsistente,
        ]
    )
    weak_count = sum(
        [
            request.sin_historial,
            request.vive_lejos,
            request.sin_local_fijo,
            request.sin_fiador,
            request.cedula_otra_region,
            request.celular_prepago,
            request.sin_cuenta_bancaria,
            request.factura_manual,
            request.fotos_poco_convincentes,
            request.sin_referencias_comerciales,
            request.nombre_distinto_recibo,
            request.negocio_pequeno_monto,
            request.direccion_sin_georreferenciar,
        ]
    )

    if strong_count > 0:
        factors.append(
            f"Se detectaron {strong_count} indicador(es) fuerte(s) de fraude "
            "(HU-02): pueden justificar alerta roja."
        )
    if request.tipo_zona.value == "rural" and weak_count > 0:
        factors.append(
            f"Caso rural con {weak_count} señal(es) débil(es): frecuente en productores "
            "sin acceso al sistema financiero formal; no implica fraude por sí solo (HU-18)."
        )
    elif weak_count > 0:
        factors.append(f"Se detectaron {weak_count} señal(es) débil(es) de informalidad (HU-02).")
    factors.append(
        "El sistema recomienda; la decisión final corresponde al analista humano (HU-09)."
    )
    # Garantizar mínimo 3 factores
    while len(factors) < 3:
        factors.append("Sin hallazgos adicionales relevantes en esta evaluación.")
    return factors[: max(3, len(factors))]


def evaluate_request(request: EvaluationRequest) -> EvaluationResponse:
    """Evalúa una solicitud y devuelve la respuesta unificada de ejemplo.

    Este método usa fixtures deterministas para validación de contrato (HU-17).
    """
    activated = _example_rules(request)
    strong_count = len(activated)
    weak_count = sum(
        [
            request.sin_historial,
            request.vive_lejos,
            request.sin_local_fijo,
            request.sin_fiador,
            request.cedula_otra_region,
            request.celular_prepago,
            request.sin_cuenta_bancaria,
            request.factura_manual,
            request.fotos_poco_convincentes,
            request.sin_referencias_comerciales,
            request.nombre_distinto_recibo,
            request.negocio_pequeno_monto,
            request.direccion_sin_georreferenciar,
        ]
    )

    # Cálculo de ejemplo: score basado en indicadores fuertes y débiles
    # HU-18: una señal débil aislada NUNCA lleva a rojo
    risk_score = min(100.0, strong_count * 15.0 + weak_count * 2.0)

    if strong_count >= 2:
        semaforo = Semaforo.ROJO
    elif strong_count == 1 or risk_score >= 40:
        semaforo = Semaforo.AMARILLO
    else:
        semaforo = Semaforo.VERDE

    return EvaluationResponse(
        risk_score=round(risk_score, 2),
        semaforo=semaforo,
        activated_rules=activated,
        bayesian_probability=round(min(1.0, strong_count * 0.2 + weak_count * 0.02), 4),
        ml_probability=round(min(1.0, strong_count * 0.18 + weak_count * 0.015), 4),
        explanatory_factors=_example_explanatory_factors(request),
        model_version=request.modelo_version or EXAMPLE_MODEL_VERSION,
        # Estado real de los motores en esta versión (HU-17): ninguno está conectado
        # todavía; la fusión híbrida llega con HU-18. Declarar "ok" un motor que no
        # corrió quebraría la trazabilidad exigida en AGENTS.md ("reportar cuál
        # motor faltó"), así que el contrato se entrega con los tres en `missing`.
        engine_status=EngineStatus(
            rules=EngineState.MISSING,
            bayesian=EngineState.MISSING,
            ml=EngineState.MISSING,
        ),
    )
