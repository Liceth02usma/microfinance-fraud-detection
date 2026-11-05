"""Generador determinista de solicitantes sintéticos para CrediConfianza.

Implementa la generación de microcréditos sintéticos para el escenario de San Juan
de la Vega, incorporando las 14 oficinas (7 urbanas, 7 rurales), las 13 señales
débiles con tasas realistas de informalidad rural, los 6 indicios fuertes y la etiqueta
de fraude real controlada (HU-06 y HU-07).
"""

from __future__ import annotations

import random
from typing import Any

import numpy as np
import pandas as pd
from faker import Faker

from app.data.schema import (
    RURAL_BRANCHES,
    STRONG_INDICATORS,
    URBAN_BRANCHES,
    BusinessType,
    CreditProduct,
    EthnicBelonging,
    Gender,
    GeneratorConfig,
    ZoneType,
)


class SyntheticDataGenerator:
    """Generador determinista de solicitudes sintéticas de microcrédito."""

    def __init__(self, config: GeneratorConfig | None = None) -> None:
        """Inicializa el generador con una configuración y semilla determinista."""
        self.config = config or GeneratorConfig()
        self._faker = Faker("es_CO")
        self.reset_seed(self.config.seed)

    def reset_seed(self, seed: int) -> None:
        """Reinicia las semillas de números pseudoaleatorios para garantizar reproducibilidad."""
        self.config.seed = seed
        np.random.seed(seed)
        random.seed(seed)
        Faker.seed(seed)
        self._faker.seed_instance(seed)

    def _sample_product(self, zone: ZoneType) -> str:
        """Muestrea el producto crediticio según la zona geográfica."""
        if zone == ZoneType.RURAL:
            # En zona rural predomina el crédito agropecuario y microempresa
            products = [
                CreditProduct.AGRICULTURAL.value,
                CreditProduct.MICROENTERPRISE.value,
                CreditProduct.CONSUMPTION.value,
                CreditProduct.HOUSING.value,
            ]
            probs = [0.55, 0.25, 0.12, 0.08]
        else:
            # En zona urbana predomina microempresa, consumo y vivienda
            products = [
                CreditProduct.MICROENTERPRISE.value,
                CreditProduct.CONSUMPTION.value,
                CreditProduct.HOUSING.value,
                CreditProduct.AGRICULTURAL.value,
            ]
            probs = [0.45, 0.30, 0.20, 0.05]
        return str(np.random.choice(products, p=probs))

    def _sample_business_type(self, zone: ZoneType, product: str) -> str:
        """Muestrea el tipo de negocio o actividad económica."""
        if product == CreditProduct.AGRICULTURAL.value or zone == ZoneType.RURAL:
            types = [
                BusinessType.FARM_PARCEL.value,
                BusinessType.MARKET_STALL_FAIR.value,
                BusinessType.FIXED_PREMISES.value,
                BusinessType.HOME_SERVICES.value,
            ]
            probs = [0.60, 0.25, 0.10, 0.05]
        else:
            types = [
                BusinessType.FIXED_PREMISES.value,
                BusinessType.HOME_SERVICES.value,
                BusinessType.MARKET_STALL_FAIR.value,
                BusinessType.FARM_PARCEL.value,
            ]
            probs = [0.55, 0.25, 0.18, 0.02]
        return str(np.random.choice(types, p=probs))

    def _sample_requested_amount(self, product: str) -> float:
        """Genera el monto solicitado en pesos colombianos según la línea de crédito."""
        if product == CreditProduct.AGRICULTURAL.value:
            # Créditos para insumos y cosechas: entre 3M y 25M COP
            return float(np.round(np.random.uniform(3_000_000, 25_000_000), -5))
        if product == CreditProduct.MICROENTERPRISE.value:
            # Capital de trabajo o activo fijo: entre 2M y 18M COP
            return float(np.round(np.random.uniform(2_000_000, 18_000_000), -5))
        if product == CreditProduct.HOUSING.value:
            # Mejoramiento de vivienda o autoconstrucción: entre 5M y 35M COP
            return float(np.round(np.random.uniform(5_000_000, 35_000_000), -5))
        # Crédito de consumo: entre 1M y 8M COP
        return float(np.round(np.random.uniform(1_000_000, 8_000_000), -5))

    def _sample_monthly_income(self, zone: ZoneType, is_seasonal: bool) -> float:
        """Genera el ingreso mensual declarado considerando la estacionalidad rural."""
        base_income = np.random.lognormal(mean=14.3, sigma=0.45)  # Media aprox. 1.8M a 2.5M COP
        if zone == ZoneType.RURAL and is_seasonal:
            # En cosechas o estacionalidad el ingreso mensual fluctúa
            factor = np.random.uniform(0.7, 1.4)
            base_income *= factor
        return float(np.round(base_income, -4))

    def _sample_weak_signals(
        self,
        zone: ZoneType,
        business_type: str,
        is_fraud: bool,
        inject_rural_bias: bool = True,
    ) -> dict[str, int]:
        """Genera las 13 señales débiles.

        En solicitantes rurales legítimos, estas señales aparecen de forma natural
        debido a la economía campesina y no representan fraude.
        """
        is_rural = zone == ZoneType.RURAL

        # Probabilidades base por zona para cada señal débil
        # En zona rural la informalidad, falta de nomenclatura y uso de efectivo son legítimos
        if is_rural and inject_rural_bias:
            prob_prepago = 0.82
            prob_sin_georref = 0.85
            prob_factura_manual = 0.78
            prob_sin_cuenta = 0.70
            prob_vive_lejos = 0.80
            prob_sin_historial = 0.58
            prob_sin_fiador = 0.52
            prob_sin_local_fijo = (
                0.72
                if business_type
                in [
                    BusinessType.FARM_PARCEL.value,
                    BusinessType.MARKET_STALL_FAIR.value,
                ]
                else 0.35
            )
            prob_fotos_dudosas = 0.45  # Conectividad y fotos de parcelas
            prob_sin_ref_comercial = 0.55
            prob_nombre_distinto_recibo = 0.48  # Arriendos verbales o predios familiares
            prob_cedula_otra_region = 0.28
            prob_negocio_pequeno = 0.35
        else:
            # Zona urbana o control sin sesgo
            prob_prepago = 0.38
            prob_sin_georref = 0.12
            prob_factura_manual = 0.25
            prob_sin_cuenta = 0.22
            prob_vive_lejos = 0.15
            prob_sin_historial = 0.30
            prob_sin_fiador = 0.40
            prob_sin_local_fijo = 0.20
            prob_fotos_dudosas = 0.18
            prob_sin_ref_comercial = 0.25
            prob_nombre_distinto_recibo = 0.20
            prob_cedula_otra_region = 0.20
            prob_negocio_pequeno = 0.22

        # Si además es fraude real, algunas señales pueden elevarse levemente
        fraud_boost = 0.10 if is_fraud else 0.0

        signals = {
            "sin_historial": int(np.random.rand() < min(0.95, prob_sin_historial + fraud_boost)),
            "vive_lejos": int(np.random.rand() < min(0.95, prob_vive_lejos)),
            "sin_local_fijo": int(np.random.rand() < min(0.95, prob_sin_local_fijo)),
            "sin_fiador": int(np.random.rand() < min(0.95, prob_sin_fiador)),
            "cedula_otra_region": int(np.random.rand() < min(0.95, prob_cedula_otra_region)),
            "celular_prepago": int(np.random.rand() < min(0.95, prob_prepago)),
            "sin_cuenta_bancaria": int(np.random.rand() < min(0.95, prob_sin_cuenta)),
            "factura_manual": int(np.random.rand() < min(0.95, prob_factura_manual)),
            "fotos_poco_convincentes": int(
                np.random.rand() < min(0.95, prob_fotos_dudosas + fraud_boost)
            ),
            "sin_referencias_comerciales": int(
                np.random.rand() < min(0.95, prob_sin_ref_comercial)
            ),
            "nombre_distinto_recibo": int(
                np.random.rand() < min(0.95, prob_nombre_distinto_recibo)
            ),
            "negocio_pequeno_monto": int(
                np.random.rand() < min(0.95, prob_negocio_pequeno + fraud_boost)
            ),
            "direccion_sin_georreferenciar": int(np.random.rand() < min(0.95, prob_sin_georref)),
        }
        return signals

    def _sample_strong_indicators(self, is_fraud: bool) -> dict[str, int]:
        """Genera los 6 indicios fuertes de fraude.

        Estos indicios representan alteraciones graves o falsedad documental y
        están altamente correlacionados con el fraude real, sin depender de la ruralidad.
        """
        indicators: dict[str, int] = {}
        for indicator in STRONG_INDICATORS:
            # Si es fraude real, al menos un indicio se activa con mayor probabilidad
            prob = 0.45 if is_fraud else 0.005
            indicators[indicator] = int(np.random.rand() < prob)

        # Garantizar que si es fraude real, exista al menos un indicio fuerte o inconsistencia
        if is_fraud and sum(indicators.values()) == 0:
            chosen = str(np.random.choice(STRONG_INDICATORS))
            indicators[chosen] = 1

        return indicators

    def generate_records(
        self,
        n_records: int | None = None,
        inject_rural_bias: bool = True,
    ) -> pd.DataFrame:
        """Genera un DataFrame completo de solicitantes sintéticos deterministas."""
        n = n_records or self.config.n_records
        records: list[dict[str, Any]] = []

        # Proporción de fraude fija según configuración (HU-07: similar rural y urbano)
        for i in range(n):
            # Identificador sintético único
            applicant_id = f"SOL-{self.config.seed}-{i + 1:06d}"

            # Zona y oficina asignada
            is_rural = np.random.rand() < self.config.rural_proportion
            zone = ZoneType.RURAL if is_rural else ZoneType.URBAN
            branch = str(np.random.choice(RURAL_BRANCHES if is_rural else URBAN_BRANCHES))

            # Variables protegidas (HU-04)
            gender_val = str(
                np.random.choice(
                    [Gender.FEMALE.value, Gender.MALE.value, Gender.OTHER.value],
                    p=[0.48, 0.50, 0.02],
                )
            )
            ethnic_probs = (
                [0.45, 0.12, 0.08, 0.35]  # Más campesinos en rural
                if is_rural
                else [0.05, 0.10, 0.05, 0.80]
            )
            ethnic_val = str(
                np.random.choice(
                    [
                        EthnicBelonging.PEASANT.value,
                        EthnicBelonging.AFRO_DESCENDANT.value,
                        EthnicBelonging.INDIGENOUS.value,
                        EthnicBelonging.NONE.value,
                    ],
                    p=ethnic_probs,
                )
            )

            # Producto y negocio
            product = self._sample_product(zone)
            business_type = self._sample_business_type(zone, product)
            is_seasonal = is_rural and (product == CreditProduct.AGRICULTURAL.value)

            # Monto e ingresos
            requested_amount = self._sample_requested_amount(product)
            monthly_income = self._sample_monthly_income(zone, is_seasonal)
            term_months = int(np.random.choice([6, 12, 18, 24, 36]))

            # Fraude real (tasa similar en ambas zonas según HU-07)
            is_fraud = bool(np.random.rand() < self.config.fraud_rate)

            # Señales débiles e indicios fuertes
            weak_signals = self._sample_weak_signals(
                zone, business_type, is_fraud, inject_rural_bias=inject_rural_bias
            )
            strong_indicators = self._sample_strong_indicators(is_fraud)

            # Datos demográficos sintéticos sin exponer personas reales
            synthetic_name = self._faker.name()
            # Cédula ficticia en rango realista pero no vinculada a personas vivas
            fake_national_id = f"CC-{np.random.randint(10_000_000, 99_999_999)}"

            row: dict[str, Any] = {
                "id_solicitud": applicant_id,
                "nombre_sintetico": synthetic_name,
                "documento_identidad": fake_national_id,
                "tipo_zona": zone.value,
                "oficina": branch,
                "genero": gender_val,
                "pertenencia_etnica": ethnic_val,
                "producto_credito": product,
                "tipo_negocio": business_type,
                "monto_solicitado": requested_amount,
                "plazo_meses": term_months,
                "ingresos_declarados": monthly_income,
                "es_estacional": int(is_seasonal),
                "antiguedad_negocio_meses": int(np.random.randint(6, 180)),
                "edad_solicitante": int(np.random.randint(18, 72)),
                "es_fraude_real": int(is_fraud),
            }
            # Agregar las 13 señales débiles
            row.update(weak_signals)
            # Agregar los 6 indicios fuertes
            row.update(strong_indicators)

            records.append(row)

        df = pd.DataFrame(records)
        return df
