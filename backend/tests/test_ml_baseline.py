"""Pruebas unitarias para el modelo de línea base ML (HU-14)."""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from app.data.generator import SyntheticDataGenerator
from app.data.schema import GeneratorConfig
from app.data.splitter import DatasetSplitter
from app.engines.ml_model import BaselineLogisticModel
from app.engines.train_baseline import main, train_and_evaluate_baseline


@pytest.fixture
def train_val_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Genera particiones pequeñas y deterministas de entrenamiento y validación."""
    config = GeneratorConfig(seed=42, n_records=800, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    train_df, val_df, _ = splitter.split(df)
    return train_df, val_df


def test_baseline_fit_and_predict(train_val_data: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verifica el entrenamiento, la estimación de probabilidades y la clasificación binaria."""
    train_df, val_df = train_val_data
    y_train = train_df["es_fraude_real"]

    model = BaselineLogisticModel(random_state=42)
    assert model.is_fitted is False

    model.fit(train_df, y_train)
    assert model.is_fitted is True

    # Comprobar probabilidades
    probs = model.predict_proba(val_df)
    assert isinstance(probs, np.ndarray)
    assert len(probs) == len(val_df)
    assert ((probs >= 0.0) & (probs <= 1.0)).all()

    # Comprobar predicciones binarias
    preds = model.predict(val_df, threshold=0.5)
    assert set(np.unique(preds)).issubset({0, 1})


def test_predict_before_fit_raises(train_val_data: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verifica que predecir sin entrenar lance un error explícito."""
    _, val_df = train_val_data
    model = BaselineLogisticModel()
    with pytest.raises(RuntimeError, match="debe ser entrenado antes de predecir"):
        model.predict_proba(val_df)


def test_missing_features_raises(train_val_data: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verifica que falten columnas obligatorias lance ValueError."""
    train_df, _ = train_val_data
    corrupted_df = train_df.drop(columns=["monto_solicitado"])
    model = BaselineLogisticModel()
    with pytest.raises(ValueError, match="Faltan columnas requeridas"):
        model.extract_features(corrupted_df)


def test_baseline_evaluate_metrics(train_val_data: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verifica el cálculo de las métricas requeridas: AUC, F1, Precisión y Recall."""
    train_df, val_df = train_val_data
    model = BaselineLogisticModel(random_state=42)
    model.fit(train_df, train_df["es_fraude_real"])

    metrics = model.evaluate(val_df, val_df["es_fraude_real"])

    assert "auc" in metrics
    assert "f1" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "brier_score" in metrics
    assert "confusion_matrix" in metrics

    # Al tener señales predictivas e indicios fuertes, el AUC debe superar el azar (0.5)
    assert metrics["auc"] >= 0.70
    assert metrics["samples_evaluated"] == len(val_df)


def test_baseline_save_and_load(
    train_val_data: tuple[pd.DataFrame, pd.DataFrame], tmp_path: Path
) -> None:
    """Verifica la serialización y restauración fiel del modelo y sus métricas."""
    train_df, val_df = train_val_data
    model = BaselineLogisticModel(random_state=42)
    model.fit(train_df, train_df["es_fraude_real"])

    metrics = model.evaluate(val_df, val_df["es_fraude_real"])
    artifact_path = tmp_path / "baseline_model.joblib"
    model.save(artifact_path, metrics=metrics)

    assert artifact_path.exists()
    metrics_path = tmp_path / "baseline_model_metrics.json"
    assert metrics_path.exists()

    # Cargar y comparar inferencias
    loaded_model = BaselineLogisticModel.load(artifact_path)
    assert loaded_model.is_fitted is True

    original_probs = model.predict_proba(val_df)
    loaded_probs = loaded_model.predict_proba(val_df)
    np.testing.assert_allclose(original_probs, loaded_probs)


def test_load_non_existent_model_raises(tmp_path: Path) -> None:
    """Verifica que intentar cargar un archivo inexistente lance FileNotFoundError."""
    with pytest.raises(FileNotFoundError, match="No se encontró el artefacto"):
        BaselineLogisticModel.load(tmp_path / "inexistente.joblib")


def test_train_and_evaluate_baseline_pipeline(tmp_path: Path) -> None:
    """Verifica el flujo completo de entrenamiento y persistencia desde archivos CSV."""
    data_dir = tmp_path / "data"
    models_dir = tmp_path / "models"
    data_dir.mkdir()
    models_dir.mkdir()

    config = GeneratorConfig(seed=42, n_records=500, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    splitter.split_and_save(df, data_dir)

    model, metrics = train_and_evaluate_baseline(data_dir=data_dir, models_dir=models_dir)

    assert (models_dir / "baseline_logistic.joblib").exists()
    assert (models_dir / "baseline_logistic_metrics.json").exists()
    assert metrics["auc"] > 0.60


def test_train_and_evaluate_missing_files_raises(tmp_path: Path) -> None:
    """Verifica error si no existen las particiones de datos en el directorio."""
    with pytest.raises(FileNotFoundError, match="No se encontraron las particiones"):
        train_and_evaluate_baseline(data_dir=tmp_path, models_dir=tmp_path)


def test_train_baseline_main_cli(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifica la ejecución de la función main del CLI de entrenamiento."""
    data_dir = tmp_path / "data"
    models_dir = tmp_path / "models"
    data_dir.mkdir()
    models_dir.mkdir()

    config = GeneratorConfig(seed=42, n_records=400, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    splitter.split_and_save(df, data_dir)

    test_args = [
        "train_baseline.py",
        "--data-dir",
        str(data_dir),
        "--models-dir",
        str(models_dir),
        "--seed",
        "42",
    ]
    monkeypatch.setattr(sys, "argv", test_args)
    main()

    assert (models_dir / "baseline_logistic.joblib").exists()
    assert (models_dir / "baseline_logistic_metrics.json").exists()
