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

    modelo_version: str = Field(default="0.1.0-baseline", description="Versión del modelo")
    fuente_datos: FuenteDatos = Field(default=FuenteDatos.TEST, description="Origen de datos")


class RuleActivation(BaseModel):
    """Una regla activada por el motor de reglas."""

    id_regla: str = Field(..., description="ID de la regla")
    peso: float = Field(..., ge=0.0, le=1.0, description="Peso 0-1")
    justificacion: str = Field(..., description="Justificación en lenguaje claro")


class EngineStatus(BaseModel):
    """Estado de disponibilidad de cada motor."""

    rules: EngineState = Field(..., description="Estado del motor de reglas")
    bayesian: EngineState = Field(..., description="Estado del motor bayesiano")
    ml: EngineState = Field(..., description="Estado del motor ML")


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
    model_version: str = Field(..., description="Versión del modelo utilizado")
    engine_status: EngineStatus | None = Field(
        default=None,
        description="Estado de motores: rules/bayesian/ml ok/missing",
    )
