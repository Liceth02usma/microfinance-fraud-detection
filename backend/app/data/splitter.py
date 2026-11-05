"""Módulo de partición estratificada del dataset (HU-08).

Implementa la partición en Entrenamiento, Validación y Prueba,
estratificada simultáneamente por fraude real y por zona geográfica
con semilla determinista para garantizar reproducibilidad.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


class DatasetSplitter:
    """Particionador estratificado para solicitudes de crédito."""

    def __init__(
        self,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        seed: int = 42,
    ) -> None:
        """Inicializa los parámetros de división y la semilla determinista."""
        total = round(train_ratio + val_ratio + test_ratio, 4)
        if total != 1.0:
            raise ValueError(f"Las proporciones deben sumar 1.0 (suma actual: {total})")

        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.seed = seed

    def _get_valid_stratify(self, df: pd.DataFrame) -> pd.Series | None:
        """Determina la mejor estrategia de estratificación según la frecuencia de clases."""
        strata = df["es_fraude_real"].astype(str) + "_" + df["tipo_zona"].astype(str)
        if strata.value_counts().min() >= 2:
            return strata
        if df["es_fraude_real"].value_counts().min() >= 2:
            return df["es_fraude_real"]
        return None

    def split(self, df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Divide el DataFrame en (train, val, test) estratificado por fraude y zona."""
        stratify_col = self._get_valid_stratify(df)

        # 1. Separar conjunto de entrenamiento
        train_df, temp_df = train_test_split(
            df,
            train_size=self.train_ratio,
            stratify=stratify_col,
            random_state=self.seed,
        )

        # 2. Separar el resto entre validación y prueba en proporción relativa
        relative_val_size = self.val_ratio / (self.val_ratio + self.test_ratio)
        temp_stratify = self._get_valid_stratify(temp_df)

        val_df, test_df = train_test_split(
            temp_df,
            train_size=relative_val_size,
            stratify=temp_stratify,
            random_state=self.seed,
        )

        # Resetear índices
        train_df = train_df.reset_index(drop=True)
        val_df = val_df.reset_index(drop=True)
        test_df = test_df.reset_index(drop=True)

        return train_df, val_df, test_df

    def split_and_save(self, df: pd.DataFrame, output_dir: Path) -> tuple[Path, Path, Path]:
        """Divide el dataset y guarda los archivos train.csv, val.csv y test.csv."""
        output_dir.mkdir(parents=True, exist_ok=True)
        train_df, val_df, test_df = self.split(df)

        train_path = output_dir / "train.csv"
        val_path = output_dir / "val.csv"
        test_path = output_dir / "test.csv"

        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)

        return train_path, val_path, test_path
