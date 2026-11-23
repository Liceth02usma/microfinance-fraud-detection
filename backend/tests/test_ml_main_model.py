"""Pruebas unitarias para el modelo principal Gradient Boosting con calibración (HU-15)."""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from app.data.generator import SyntheticDataGenerator
from app.data.schema import GeneratorConfig
from app.data.splitter import DatasetSplitter
from app.engines.ml_model import GradientBoostingModel
from app.engines.train_main_model import main, train_and_evaluate_main_model


@pytest.fixture
def train_val_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Genera particiones deterministas pequeñas para pruebas rápidas de Gradient Boosting."""
    config = GeneratorConfig(seed=42, n_records=600, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    train_df, val_df, _ = splitter.split(df)
    return train_df, val_df


def test_main_model_fit_and_predict(train_val_data: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verifica entrenamiento, validación cruzada, probabilidades calibradas y predicción."""
    train_df, val_df = train_val_data
    y_train = train_df["es_fraude_real"]

    model = GradientBoostingModel(
        n_estimators=20,
        max_depth=3,
        cv_folds=2,
        random_state=42,
    )
    assert model.is_fitted is False

    model.fit(train_df, y_train)
    assert model.is_fitted is True
    assert "cv_auc_mean" in model.cv_metrics
    assert "cv_f1_mean" in model.cv_metrics

    # Comprobar probabilidades calibradas
    probs = model.predict_proba(val_df)
    assert isinstance(probs, np.ndarray)
    assert len(probs) == len(val_df)
    assert ((probs >= 0.0) & (probs <= 1.0)).all()

    # Comprobar predicciones binarias
    preds = model.predict(val_df, threshold=0.5)
    assert set(np.unique(preds)).issubset({0, 1})


def test_main_model_predict_before_fit_raises(
    train_val_data: tuple[pd.DataFrame, pd.DataFrame],
) -> None:
    """Verifica que predecir sin entrenar lance un error explícito."""
    _, val_df = train_val_data
    model = GradientBoostingModel()
    with pytest.raises(RuntimeError, match="debe ser entrenado antes de predecir"):
        model.predict_proba(val_df)


def test_main_model_missing_features_raises(
    train_val_data: tuple[pd.DataFrame, pd.DataFrame],
) -> None:
    """Verifica que falten columnas obligatorias lance ValueError."""
    train_df, _ = train_val_data
    corrupted_df = train_df.drop(columns=["ingresos_declarados"])
    model = GradientBoostingModel()
    with pytest.raises(ValueError, match="Faltan columnas requeridas"):
        model.extract_features(corrupted_df)


def test_main_model_evaluates_brier_and_calibration(
    train_val_data: tuple[pd.DataFrame, pd.DataFrame],
) -> None:
    """Verifica el cálculo de Brier Score, curva de calibración y métricas de HU-15."""
    train_df, val_df = train_val_data
    model = GradientBoostingModel(
        n_estimators=25,
        max_depth=3,
        cv_folds=2,
        random_state=42,
    )
    model.fit(train_df, train_df["es_fraude_real"])

    metrics = model.evaluate(val_df, val_df["es_fraude_real"])

    assert "auc" in metrics
    assert "f1" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "brier_score" in metrics
    assert "calibration_curve" in metrics
    assert "prob_true" in metrics["calibration_curve"]
    assert "prob_pred" in metrics["calibration_curve"]
    assert "confusion_matrix" in metrics
    assert "cv_metrics" in metrics

    assert metrics["auc"] >= 0.70
    assert metrics["brier_score"] <= 0.25  # Brier razonable


def test_main_model_save_and_load(
    train_val_data: tuple[pd.DataFrame, pd.DataFrame], tmp_path: Path
) -> None:
    """Verifica la persistencia y carga del modelo calibrado en disco."""
    train_df, val_df = train_val_data
    model = GradientBoostingModel(
        n_estimators=20,
        max_depth=3,
        cv_folds=2,
        random_state=42,
    )
    model.fit(train_df, train_df["es_fraude_real"])

    metrics = model.evaluate(val_df, val_df["es_fraude_real"])
    artifact_path = tmp_path / "main_model.joblib"
    model.save(artifact_path, metrics=metrics)

    assert artifact_path.exists()
    assert (tmp_path / "main_model_metrics.json").exists()

    loaded_model = GradientBoostingModel.load(artifact_path)
    assert loaded_model.is_fitted is True

    original_probs = model.predict_proba(val_df)
    loaded_probs = loaded_model.predict_proba(val_df)
    np.testing.assert_allclose(original_probs, loaded_probs, rtol=1e-5)


def test_main_model_load_non_existent_raises(tmp_path: Path) -> None:
    """Verifica que intentar cargar un modelo inexistente lance FileNotFoundError."""
    with pytest.raises(FileNotFoundError, match="No se encontró el artefacto"):
        GradientBoostingModel.load(tmp_path / "inexistente.joblib")


def test_train_main_model_pipeline_cli(tmp_path: Path) -> None:
    """Verifica el flujo de entrenamiento CLI con datasets en disco."""
    data_dir = tmp_path / "data"
    models_dir = tmp_path / "models"
    data_dir.mkdir()
    models_dir.mkdir()

    config = GeneratorConfig(seed=42, n_records=400, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    splitter.split_and_save(df, data_dir)

    model, metrics = train_and_evaluate_main_model(
        data_dir=data_dir,
        models_dir=models_dir,
        random_state=42,
        calibration_method="sigmoid",
    )

    assert (models_dir / "main_gradient_boosting.joblib").exists()
    assert (models_dir / "main_gradient_boosting_metrics.json").exists()
    assert "calibration_curve" in metrics


def test_train_main_model_missing_data_raises(tmp_path: Path) -> None:
    """Verifica excepción si faltan archivos en data_dir."""
    with pytest.raises(FileNotFoundError, match="No se encontraron las particiones"):
        train_and_evaluate_main_model(data_dir=tmp_path, models_dir=tmp_path)


def test_train_main_model_main_cli(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifica la ejecución de la función main del CLI para el modelo principal."""
    data_dir = tmp_path / "data"
    models_dir = tmp_path / "models"
    data_dir.mkdir()
    models_dir.mkdir()

    # Escribir métricas simuladas de línea base para ejercitar la comparativa en consola
    baseline_fake = {
        "auc": 0.99,
        "f1": 0.70,
        "precision": 0.54,
        "recall": 1.0,
        "brier_score": 0.02,
    }
    with open(models_dir / "baseline_logistic_metrics.json", "w", encoding="utf-8") as f:
        json.dump(baseline_fake, f)

    config = GeneratorConfig(seed=42, n_records=350, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    splitter.split_and_save(df, data_dir)

    test_args = [
        "train_main_model.py",
        "--data-dir",
        str(data_dir),
        "--models-dir",
        str(models_dir),
        "--seed",
        "42",
        "--calibration-method",
        "sigmoid",
    ]
    monkeypatch.setattr(sys, "argv", test_args)
    main()

    assert (models_dir / "main_gradient_boosting.joblib").exists()
    assert (models_dir / "main_gradient_boosting_metrics.json").exists()
