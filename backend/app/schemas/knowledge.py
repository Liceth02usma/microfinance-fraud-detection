"""Esquemas de la base de conocimiento expuesta a la interfaz (HU-10, HU-24).

La interfaz no debe mantener copias propias de las reglas, los pesos de
fusión ni los umbrales del semáforo: los lee de aquí para que lo que ve el
analista sea exactamente lo que ejecuta el backend.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class KnowledgeRule(BaseModel):
    """Una regla de `knowledge/reglas.yaml`, tal como la carga el motor."""

    id: str = Field(..., description="Identificador de la regla (R-WEAK-01…)")
    categoria: str = Field(..., description="debil | fuerte | salvaguarda | bias")
    senal: str | None = Field(None, description="Señal asociada, si aplica")
    condicion: str = Field(..., description="Condición en lenguaje claro")
    accion: str = Field(..., description="Acción del motor")
    peso: float = Field(..., description="Peso de la regla (negativo = descuento)")
    tope_rural: float | None = Field(None, description="Tope del aporte en zona rural")
    justificacion: str = Field(..., description="Justificación en lenguaje claro")
    fuente: str = Field(..., description="Fuente del conocimiento")
    contexto_rural: str | None = Field(None, description="Explicación rural legítima")


class FusionWeights(BaseModel):
    """Pesos de la fusión ponderada (fusion.yaml)."""

    rules: float
    bayesian: float
    ml: float


class StrongFloor(BaseModel):
    """Piso del semáforo según número de indicios fuertes."""

    min_strong: int
    semaforo: str


class FusionInfo(BaseModel):
    """Configuración vigente de la fusión y del semáforo (HU-18, HU-19)."""

    version: str
    weights: FusionWeights
    verde_max: float = Field(..., description="Puntaje < verde_max → verde")
    amarillo_max: float = Field(..., description="Puntaje < amarillo_max → amarillo; si no, rojo")
    strong_signal_floors: list[StrongFloor]


class KnowledgeResponse(BaseModel):
    """Base de conocimiento y configuración vigente del sistema."""

    rules_version: str
    rules: list[KnowledgeRule]
    fusion: FusionInfo
    model_version: str = Field(..., description="Versión del modelo ML activo")
