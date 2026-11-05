"""Motor de aprendizaje automático para detección de fraude en microfinanzas.

Implementa la línea base de regresión logística con ponderación de clases para
manejo de desbalance (HU-14), excluyendo variables sensibles directas (HU-04).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.data.schema import STRONG_INDICATORS, WEAK_SIGNALS

# Variables continuas y discretas financieras
NUMERIC_FEATURES: list[str] = [
    "monto_solicitado",
    "plazo_meses",
    "ingresos_declarados",
    "antiguedad_negocio_meses",
    "edad_solicitante",
]

# Variables categóricas transaccionales y de actividad
CATEGORICAL_FEATURES: list[str] = [
    "producto_credito",
    "tipo_negocio",
]

# Variables binarias operativas, señales débiles e indicios fuertes
BINARY_FEATURES: list[str] = ["es_estacional"] + WEAK_SIGNALS + STRONG_INDICATORS

# Columnas protegidas y de identificación excluidas del entrenamiento (HU-04)
EXCLUDED_FEATURES: list[str] = [
    "id_solicitud",
    "nombre_sintetico",
    "documento_identidad",
    "tipo_zona",
    "oficina",
    "genero",
    "pertenencia_etnica",
    "es_fraude_real",
]


class BaselineLogisticModel:
    """Modelo de línea base basado en Regresión Logística con balanceo de clases."""

    VERSION: str = "0.1.0-baseline-logistic"

    def __init__(self, random_state: int = 42, max_iter: int = 1000) -> None:
        """Inicializa el modelo con preprocesador y clasificador calibrado."""
        self.random_state = random_state
        self.max_iter = max_iter
        self.pipeline: Pipeline = self._build_pipeline()
        self.is_fitted: bool = False

    def _build_pipeline(self) -> Pipeline:
        """Construye el pipeline de preprocesamiento y el estimador logístico."""
        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "num",
                    StandardScaler(),
                    NUMERIC_FEATURES,
                ),
                (
                    "cat",
                    OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                    CATEGORICAL_FEATURES,
                ),
                (
                    "bin",
                    "passthrough",
                    BINARY_FEATURES,
                ),
            ],
            remainder="drop",
        )

        classifier = LogisticRegression(
            class_weight="balanced",  # HU-14: Manejo de desbalance por ponderación inversa
            random_state=self.random_state,
            max_iter=self.max_iter,
            solver="lbfgs",
        )

        return Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("classifier", classifier),
            ]
        )

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Filtra y valida que las columnas de entrada contengan las variables requeridas."""
        required = NUMERIC_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise ValueError(f"Faltan columnas requeridas para el modelo ML: {missing}")
        return df[required]

    def fit(self, x_df: pd.DataFrame, y: pd.Series | np.ndarray) -> BaselineLogisticModel:
        """Entrena el pipeline de regresión logística sobre el conjunto de entrenamiento."""
        features_df = self.extract_features(x_df)
        self.pipeline.fit(features_df, y)
        self.is_fitted = True
        return self

    def predict_proba(self, x_df: pd.DataFrame) -> np.ndarray:
        """Estima la probabilidad de fraude (clase 1) para cada solicitud."""
        if not self.is_fitted:
            raise RuntimeError("El modelo debe ser entrenado antes de predecir.")
        features_df = self.extract_features(x_df)
        # Probabilidad de clase 1 (fraude)
        probs = self.pipeline.predict_proba(features_df)[:, 1]
        return np.asarray(probs, dtype=float)

    def predict(self, x_df: pd.DataFrame, threshold: float = 0.5) -> np.ndarray:
        """Clasifica binariamente según un umbral de decisión."""
        probs = self.predict_proba(x_df)
        return (probs >= threshold).astype(int)

    def evaluate(self, x_df: pd.DataFrame, y: pd.Series | np.ndarray) -> dict[str, Any]:
        """Calcula métricas estándar de clasificación supervisada sobre un conjunto de datos."""
        probs = self.predict_proba(x_df)
        preds = (probs >= 0.5).astype(int)
        y_true = np.asarray(y, dtype=int)

        auc = float(roc_auc_score(y_true, probs))
        f1 = float(f1_score(y_true, preds, zero_division=0))
        precision = float(precision_score(y_true, preds, zero_division=0))
        recall = float(recall_score(y_true, preds, zero_division=0))
        brier = float(brier_score_loss(y_true, probs))
        cm = confusion_matrix(y_true, preds).tolist()

        return {
            "model_version": self.VERSION,
            "class_weight": "balanced",
            "threshold": 0.5,
            "auc": round(auc, 4),
            "f1": round(f1, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "brier_score": round(brier, 4),
            "confusion_matrix": cm,
            "samples_evaluated": len(y_true),
        }

    def save(self, model_path: Path, metrics: dict[str, Any] | None = None) -> None:
        """Persiste el artefacto del modelo y opcionalmente sus métricas asociadas."""
        model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.pipeline, model_path)

        if metrics is not None:
            metrics_path = model_path.with_name(f"{model_path.stem}_metrics.json")
            with open(metrics_path, "w", encoding="utf-8") as f:
                json.dump(metrics, f, indent=2, ensure_ascii=False)

    @classmethod
    def load(cls, model_path: Path) -> BaselineLogisticModel:
        """Carga un modelo serializado desde el disco."""
        if not model_path.exists():
            raise FileNotFoundError(f"No se encontró el artefacto del modelo en: {model_path}")
        instance = cls()
        instance.pipeline = joblib.load(model_path)
        instance.is_fitted = True
        return instance
