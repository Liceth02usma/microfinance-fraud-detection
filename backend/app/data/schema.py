"""Esquemas y definiciones de constantes para los datos sintéticos de CrediConfianza.

Este módulo define las enumeraciones, variables protegidas, señales débiles,
indicios fuertes y esquemas Pydantic correspondientes al dominio de microfinanzas.
"""

from enum import Enum

from pydantic import BaseModel, Field


class ZoneType(str, Enum):
    """Tipo de zona geográfica donde opera el solicitante."""

    URBAN = "urbana"
    RURAL = "rural"


class CreditProduct(str, Enum):
    """Líneas de producto de microcrédito ofrecidas por CrediConfianza."""

    CONSUMPTION = "consumo"
    MICROENTERPRISE = "microempresa"
    HOUSING = "vivienda"
    AGRICULTURAL = "agropecuario"


class Gender(str, Enum):
    """Género del solicitante (variable protegida según HU-04)."""

    FEMALE = "femenino"
    MALE = "masculino"
    OTHER = "otro"


class EthnicBelonging(str, Enum):
    """Pertenencia étnica o comunitaria simulada (variable protegida)."""

    PEASANT = "campesino"
    AFRO_DESCENDANT = "afrodescendiente"
    INDIGENOUS = "indigena"
    NONE = "ninguno"


class BusinessType(str, Enum):
    """Tipo de negocio o actividad económica del solicitante."""

    FIXED_PREMISES = "local_fijo"
    MARKET_STALL_FAIR = "plaza_mercado_feria"
    FARM_PARCEL = "parcela_finca"
    HOME_SERVICES = "servicios_domicilio"


# 14 oficinas de CrediConfianza (7 urbanas y 7 rurales en San Juan de la Vega)
URBAN_BRANCHES: list[str] = [
    "Oficina Central San Juan",
    "Oficina San Juan Norte",
    "Oficina San Juan Sur",
    "Oficina Parque Principal",
    "Oficina Avenida Comercio",
    "Oficina Terminal",
    "Oficina Zona Industrial",
]

RURAL_BRANCHES: list[str] = [
    "Corregimiento El Porvenir",
    "Vereda Las Palmas",
    "Corregimiento La Vega",
    "Vereda Monteverde",
    "Corregimiento El Silencio",
    "Vereda Bella Vista",
    "Corregimiento San Isidro",
]

# 13 Señales Débiles (HU-02) que reflejan informalidad o ruralidad y no deben penalizar solas
WEAK_SIGNALS: list[str] = [
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

# 6 Indicios Fuertes de Fraude (HU-02) que representan fraude directo o inconsistencias críticas
STRONG_INDICATORS: list[str] = [
    "cedula_alterada",
    "ingresos_inconsistentes",
    "factura_falsa",
    "referencias_falsas",
    "historial_adverso",
    "negocio_inconsistente",
]


class GeneratorConfig(BaseModel):
    """Configuración para el generador determinista de datos sintéticos."""

    seed: int = Field(default=42, description="Semilla determinista para reproducibilidad")
    n_records: int = Field(
        default=12000,
        ge=50,
        le=50000,
        description="Número de solicitantes sintéticos a generar (10k a 38k según HU-06)",
    )
    fraud_rate: float = Field(
        default=0.035,
        ge=0.01,
        le=0.10,
        description="Tasa global de fraude real (2% a 5% configurable según HU-07)",
    )
    rural_proportion: float = Field(
        default=0.50,
        ge=0.10,
        le=0.90,
        description="Proporción aproximada de solicitudes rurales vs urbanas",
    )
