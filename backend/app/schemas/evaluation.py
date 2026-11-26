"""Esquemas Pydantic para la evaluación de solicitudes de crédito (HU-17).

Estos DTO definen el contrato HTTP de POST /api/v1/evaluate.
Nombres de campo en JSON usan `semaforo` sin tilde como identificador de contrato.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class TipoZona(str, Enum):
    """Tipo de zona del solicitante."""

    URBANA = "urbana"
    RURAL = "rural"


class Genero(str, Enum):
    """Género del solicitante."""

    FEMENINO = "femenino"
    MASCULINO = "masculino"
    OTRO = "otro"


class PertenenciaEtnica(str, Enum):
    """Pertenencia étnica o campesina (variable sensible, HU-04)."""

    CAMPESINO = "campesino"
    AFRODESCENDIENTE = "afrodescendiente"
    INDIGENA = "indigena"
    NINGUNO = "ninguno"


class ProductoCredito(str, Enum):
    """Producto de crédito solicitado."""

    CONSUMO = "consumo"
    MICROEMPRESA = "microempresa"
    VIVIENDA = "vivienda"
    AGROPECUARIO = "agropecuario"


class TipoNegocio(str, Enum):
    """Tipo de negocio declarado."""

    LOCAL_FIJO = "local_fijo"
    PLAZA_MERCADO_FERIA = "plaza_mercado_feria"
    PARCELA_FINCA = "parcela_finca"
    SERVICIOS_DOMICILIO = "servicios_domicilio"


class FuenteDatos(str, Enum):
    """Origen de los datos de la solicitud."""

    SINTETICO = "sintetico"
    REAL = "real"
    TEST = "test"


class Semaforo(str, Enum):
    """Clasificación de riesgo (semáforo). La API recomienda; el humano decide (HU-09)."""

    VERDE = "verde"
    AMARILLO = "amarillo"
    ROJO = "rojo"


class EngineState(str, Enum):
    """Estado de cada motor de evaluación."""

    OK = "ok"
    MISSING = "missing"


class EvaluationRequest(BaseModel):
    """Datos de entrada para la evaluación de riesgo de fraude."""

    id_solicitud: str = Field(..., description="Identificador único (SOL-####-######)")
    tipo_zona: TipoZona = Field(..., description="Zona: urbana o rural")
    oficina: str = Field(..., description="Oficina de CrediConfianza")
    genero: Genero = Field(..., description="Género del solicitante")
    pertenencia_etnica: PertenenciaEtnica = Field(..., description="Pertenencia étnica")
    producto_credito: ProductoCredito = Field(..., description="Producto de crédito")
    tipo_negocio: TipoNegocio = Field(..., description="Tipo de negocio")
    monto_solicitado: float = Field(..., ge=1_000_000, le=35_000_000, description="Monto en COP")
    plazo_meses: int = Field(..., ge=6, le=36, description="Plazo en meses")
    ingresos_declarados: float = Field(..., gt=0, description="Ingresos declarados en COP")
    edad_solicitante: int = Field(..., ge=18, le=72, description="Edad del titular")
    es_estacional: bool = Field(..., description="¿Negocio estacional?")
    antiguedad_negocio_meses: int = Field(
        default=36,
        ge=0,
        le=720,
        description="Antigüedad del negocio en meses (feature del modelo ML)",
    )

    # 13 señales débiles (HU-02)
    sin_historial: bool = Field(..., description="Sin historial crediticio")
    vive_lejos: bool = Field(..., description="Vive lejos de la oficina")
    sin_local_fijo: bool = Field(..., description="Sin local fijo")
    sin_fiador: bool = Field(..., description="Sin fiador")
    cedula_otra_region: bool = Field(..., description="Cédula de otra región")
    celular_prepago: bool = Field(..., description="Celular prepago")
    sin_cuenta_bancaria: bool = Field(..., description="Sin cuenta bancaria")
    factura_manual: bool = Field(..., description="Factura manual")
    fotos_poco_convincentes: bool = Field(..., description="Fotos poco convincentes")
    sin_referencias_comerciales: bool = Field(..., description="Sin referencias comerciales")
    nombre_distinto_recibo: bool = Field(..., description="Nombre distinto al del recibo")
    negocio_pequeno_monto: bool = Field(..., description="Negocio pequeño para el monto")
    direccion_sin_georreferenciar: bool = Field(..., description="Dirección sin georreferenciar")

    # 6 indicadores fuertes (HU-02) — por defecto False
    cedula_alterada: bool = Field(False, description="Cédula alterada")
    ingresos_inconsistentes: bool = Field(False, description="Ingresos inconsistentes")
    factura_falsa: bool = Field(False, description="Factura falsa")
    referencias_falsas: bool = Field(False, description="Referencias falsas")
    historial_adverso: bool = Field(False, description="Historial adverso")
    negocio_inconsistente: bool = Field(False, description="Negocio inconsistente")

    modelo_version: str | None = Field(
        default=None,
        description=(
            "Versión del modelo que el cliente espera (informativa). La respuesta "
            "siempre reporta la versión realmente ejecutada."
        ),
    )
    fuente_datos: FuenteDatos = Field(default=FuenteDatos.TEST, description="Origen de datos")


class RuleActivation(BaseModel):
    """Una regla activada por el motor de reglas.

    `peso` puede ser negativo: las salvaguardas de equidad (R-SAFE-*) descuentan
    del subpuntaje para no castigar la ruralidad (HU-18).
    """

    id_regla: str = Field(..., description="ID de la regla")
    peso: float = Field(..., ge=-1.0, le=1.0, description="Peso en [-1,1]; negativo = descuento")
    justificacion: str = Field(..., description="Justificación en lenguaje claro")


class EngineStatus(BaseModel):
    """Estado de disponibilidad de cada motor."""

    rules: EngineState = Field(..., description="Estado del motor de reglas")
    bayesian: EngineState = Field(..., description="Estado del motor bayesiano")
    ml: EngineState = Field(..., description="Estado del motor ML")


class RulesReasoning(BaseModel):
    """Cómo llegó el motor de reglas a su subpuntaje (HU-11, HU-18)."""

    strong_score: float = Field(..., description="Suma de pesos de reglas fuertes y salvaguardas")
    weak_score_raw: float = Field(..., description="Suma de pesos de señales débiles sin topar")
    weak_score_applied: float = Field(..., description="Aporte débil tras la salvaguarda rural")
    rural_cap: float = Field(..., description="Tope de la salvaguarda rural R-SAFE-01")
    rural_cap_applied: bool = Field(..., description="¿Se aplicó el tope rural?")
    subscore: float = Field(..., ge=0.0, le=1.0, description="Subpuntaje final 0–1")


class BayesianEvidence(BaseModel):
    """Aporte de un nodo observado a P(fraude | evidencia).

    `likelihood_ratio` = P(e | fraude, padres) / P(e | no fraude, padres):
    > 1 sube la probabilidad, < 1 la baja, ≈ 1 no la mueve.
    """

    variable: str = Field(..., description="Nodo de la red")
    observed: bool = Field(..., description="Valor observado (sí/no)")
    kind: str = Field(..., description="debil | fuerte")
    likelihood_ratio: float = Field(..., gt=0.0, description="Razón de verosimilitud")


class BayesianReasoning(BaseModel):
    """Cadena prior → evidencia → posterior de la red bayesiana (HU-13)."""

    prior: float = Field(..., ge=0.0, le=1.0, description="P(fraude | zona) antes de la evidencia")
    posterior: float = Field(..., ge=0.0, le=1.0, description="P(fraude | toda la evidencia)")
    evidence: list[BayesianEvidence] = Field(
        default_factory=list, description="Evidencia ordenada por impacto |log LR|"
    )


class ShapContribution(BaseModel):
    """Contribución SHAP de una variable a la predicción del modelo ML (HU-20)."""

    feature: str
    title: str
    shap_value: float = Field(..., description="> 0 aumenta el riesgo; < 0 lo reduce")
    is_rural_context: bool = False


class MlReasoning(BaseModel):
    """Variables que más empujaron la probabilidad del XGBoost (SHAP)."""

    probability: float = Field(..., ge=0.0, le=1.0)
    contributions: list[ShapContribution] = Field(default_factory=list)


class FusionPart(BaseModel):
    """Aporte de un motor al puntaje fusionado."""

    engine: str = Field(..., description="rules | bayesian | ml")
    weight: float = Field(..., description="Peso efectivo (renormalizado si falta un motor)")
    value: float = Field(..., ge=0.0, le=1.0, description="Salida 0–1 del motor")
    points: float = Field(..., description="Aporte en puntos sobre 100")


class FusionReasoning(BaseModel):
    """Desglose de la fusión ponderada y del semáforo (HU-18, HU-19)."""

    parts: list[FusionPart]
    verde_max: float
    amarillo_max: float
    strong_count: int = Field(..., ge=0)
    semaforo_by_score: Semaforo = Field(..., description="Semáforo solo por umbrales")
    floor_applied: bool = Field(..., description="¿Un piso por indicios fuertes elevó el semáforo?")
    fusion_version: str


class EngineReasoning(BaseModel):
    """Razonamiento de cada motor; `None` si el motor no estuvo disponible."""

    rules: RulesReasoning | None = None
    bayesian: BayesianReasoning | None = None
    ml: MlReasoning | None = None
    fusion: FusionReasoning


class EvaluationResponse(BaseModel):
    """Respuesta unificada del servicio de evaluación.

    El sistema recomienda; la decisión final es del analista humano (HU-09, HU-26).
    """

    risk_score: float = Field(..., ge=0, le=100, description="Puntaje de riesgo 0-100")
    semaforo: Semaforo = Field(..., description="Clasificación: verde/amarillo/rojo")
    activated_rules: list[RuleActivation] = Field(
        default_factory=list, description="Reglas activadas por el motor de reglas"
    )
    bayesian_probability: float = Field(
        ..., ge=0.0, le=1.0, description="P(Fraude | evidencia) según red bayesiana"
    )
    ml_probability: float = Field(..., ge=0.0, le=1.0, description="Probabilidad del modelo ML")
    explanatory_factors: list[str] = Field(
        ..., min_length=3, description="Factores explicativos (mínimo 3, HU-20)"
    )
    rules_subscore: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Subpuntaje 0–1 del motor de reglas (antes de la fusión ponderada)",
    )
    model_version: str = Field(..., description="Versión del modelo utilizado")
    engine_status: EngineStatus | None = Field(
        default=None,
        description="Estado de motores: rules/bayesian/ml ok/missing",
    )
    reasoning: EngineReasoning | None = Field(
        default=None,
        description="Razonamiento detallado de cada motor y de la fusión (HU-20)",
    )
