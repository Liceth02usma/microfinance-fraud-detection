"""Módulo de validación de calidad, integridad y consistencia del dataset (HU-08).

Verifica ausencia de valores nulos, plausibilidad de rangos numéricos,
coherencia de categorías y proporciones de fraude y zona geográfica.
"""

from __future__ import annotations

from typing import Any

import pandas as pd

from app.data.schema import (
    RURAL_BRANCHES,
    STRONG_INDICATORS,
    URBAN_BRANCHES,
    WEAK_SIGNALS,
    BusinessType,
    CreditProduct,
    EthnicBelonging,
    Gender,
    ZoneType,
)


class ValidationResult:
    """Resultado detallado de la validación de un dataset."""

    def __init__(self, is_valid: bool, errors: list[str], summary: dict[str, Any]) -> None:
        """Inicializa el contenedor de resultados de validación."""
        self.is_valid = is_valid
        self.errors = errors
        self.summary = summary

    def __repr__(self) -> str:
        """Representación legible del estado de validación."""
        status = "VALID" if self.is_valid else "INVALID"
        return f"<ValidationResult status={status} errors_count={len(self.errors)}>"


class DatasetValidator:
    """Validador estricto de integridad y consistencia para datos de CrediConfianza."""

    REQUIRED_COLUMNS: list[str] = (
        [
            "id_solicitud",
            "nombre_sintetico",
            "documento_identidad",
            "tipo_zona",
            "oficina",
            "genero",
            "pertenencia_etnica",
            "producto_credito",
            "tipo_negocio",
            "monto_solicitado",
            "plazo_meses",
            "ingresos_declarados",
            "es_estacional",
            "antiguedad_negocio_meses",
            "edad_solicitante",
            "es_fraude_real",
        ]
        + WEAK_SIGNALS
        + STRONG_INDICATORS
    )

    @classmethod
    def validate(cls, df: pd.DataFrame) -> ValidationResult:
        """Ejecuta todas las reglas de validación sobre el DataFrame proporcionado."""
        errors: list[str] = []

        # 1. Comprobar columnas requeridas
        missing_cols = [col for col in cls.REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            errors.append(f"Columnas faltantes en el dataset: {missing_cols}")
            return ValidationResult(is_valid=False, errors=errors, summary={})

        # 2. Comprobar valores nulos
        null_counts = df[cls.REQUIRED_COLUMNS].isnull().sum()
        cols_with_nulls = null_counts[null_counts > 0]
        if not cols_with_nulls.empty:
            errors.append(f"Se encontraron valores nulos: {cols_with_nulls.to_dict()}")

        # 3. Comprobar tipos de datos y rangos numéricos
        if (df["monto_solicitado"] <= 0).any():
            errors.append("Existen montos solicitados menores o iguales a cero.")

        if (df["ingresos_declarados"] <= 0).any():
            errors.append("Existen ingresos declarados menores o iguales a cero.")

        if ((df["edad_solicitante"] < 18) | (df["edad_solicitante"] > 100)).any():
            errors.append("Existen edades de solicitante fuera del rango válido (18-100 años).")

        valid_terms = {6, 12, 18, 24, 36}
        terms_in_df = set(df["plazo_meses"].unique())
        if not terms_in_df.issubset(valid_terms):
            errors.append(f"Plazos inválidos encontrados: {terms_in_df - valid_terms}")

        # 4. Comprobar consistencia binaria de señales débiles e indicios fuertes
        binary_cols = WEAK_SIGNALS + STRONG_INDICATORS + ["es_fraude_real", "es_estacional"]
        for bcol in binary_cols:
            vals = set(df[bcol].unique())
            if not vals.issubset({0, 1}):
                errors.append(f"La columna '{bcol}' contiene valores no binarios: {vals}")

        # 5. Comprobar valores categóricos válidos
        valid_zones = {z.value for z in ZoneType}
        if not set(df["tipo_zona"].unique()).issubset(valid_zones):
            errors.append("Valores desconocidos en 'tipo_zona'.")

        valid_products = {p.value for p in CreditProduct}
        if not set(df["producto_credito"].unique()).issubset(valid_products):
            errors.append("Valores desconocidos en 'producto_credito'.")

        valid_genders = {g.value for g in Gender}
        if not set(df["genero"].unique()).issubset(valid_genders):
            errors.append("Valores desconocidos en 'genero'.")

        valid_ethnic = {e.value for e in EthnicBelonging}
        if not set(df["pertenencia_etnica"].unique()).issubset(valid_ethnic):
            errors.append("Valores desconocidos en 'pertenencia_etnica'.")

        valid_business = {b.value for b in BusinessType}
        if not set(df["tipo_negocio"].unique()).issubset(valid_business):
            errors.append("Valores desconocidos en 'tipo_negocio'.")

        all_branches = set(URBAN_BRANCHES + RURAL_BRANCHES)
        if not set(df["oficina"].unique()).issubset(all_branches):
            errors.append("Existen oficinas que no pertenecen a las 14 sedes de CrediConfianza.")

        # 6. Estadísticas de resumen del dataset
        fraud_rate = float(df["es_fraude_real"].mean())
        rural_rate = float((df["tipo_zona"] == ZoneType.RURAL.value).mean())

        # Validación de proporciones esperadas según HU-06 y HU-07
        if not (0.015 <= fraud_rate <= 0.065):
            errors.append(f"Tasa de fraude fuera de rango plausible (2%-5%): {fraud_rate:.3f}")

        summary = {
            "total_records": len(df),
            "fraud_rate": fraud_rate,
            "rural_rate": rural_rate,
            "urban_rate": 1.0 - rural_rate,
            "mean_requested_amount": float(df["monto_solicitado"].mean()),
            "mean_income": float(df["ingresos_declarados"].mean()),
            "total_nulls": int(df[cls.REQUIRED_COLUMNS].isnull().sum().sum()),
        }

        is_valid = len(errors) == 0
        return ValidationResult(is_valid=is_valid, errors=errors, summary=summary)
