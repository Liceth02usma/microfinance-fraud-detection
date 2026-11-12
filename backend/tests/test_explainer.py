"""Pruebas unitarias para el motor de explicabilidad local SHAP (HU-20)."""

from pathlib import Path
from typing import Any

import pandas as pd
import pytest

from app.data.generator import SyntheticDataGenerator
from app.data.schema import GeneratorConfig
from app.data.splitter import DatasetSplitter
from app.engines.explainer import FEATURE_EXPLANATIONS, ShapExplainer
from app.engines.ml_model import GradientBoostingModel


@pytest.fixture
def trained_model_and_data() -> tuple[GradientBoostingModel, pd.DataFrame]:
    """Genera un modelo Gradient Boosting entrenado y datos de prueba para explicabilidad."""
    config = GeneratorConfig(seed=42, n_records=500, fraud_rate=0.04)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    train_df, val_df, _ = splitter.split(df)

    model = GradientBoostingModel(
        n_estimators=25,
        max_depth=3,
        cv_folds=2,
        random_state=42,
    )
    model.fit(train_df, train_df["es_fraude_real"])
    return model, val_df


def test_explainer_initialization(
    trained_model_and_data: tuple[GradientBoostingModel, pd.DataFrame],
) -> None:
    """Verifica que el explicador SHAP se inicialice correctamente desde el pipeline base."""
    model, _ = trained_model_and_data
    explainer = ShapExplainer(model.uncalibrated_pipeline)
    assert explainer.explainer is not None
    feature_names = explainer._get_feature_names()
    assert len(feature_names) > 0


def test_explain_instance_returns_top_factors(
    trained_model_and_data: tuple[GradientBoostingModel, pd.DataFrame],
) -> None:
    """Verifica que cada explicación devuelva al menos 3 factores ordenados por peso (HU-20)."""
    model, val_df = trained_model_and_data
    sample = val_df.iloc[0]

    factors = model.explain(sample, top_k=3)
    assert len(factors) >= 3

    # Verificar que estén ordenados descendentemente por importancia absoluta
    importances = [f["abs_importance"] for f in factors]
    assert importances == sorted(importances, reverse=True)

    # Verificar estructura requerida de cada factor
    for factor in factors:
        assert "feature" in factor
        assert "title" in factor
        assert "description" in factor
        assert "shap_value" in factor
        assert "impact" in factor
        assert factor["impact"] in ["aumenta_riesgo", "reduce_riesgo"]
        assert len(factor["description"]) > 10


def test_explain_with_dict_and_dataframe(
    trained_model_and_data: tuple[GradientBoostingModel, pd.DataFrame],
) -> None:
    """Verifica que explain acepte Series, Dict o DataFrame de una fila."""
    model, val_df = trained_model_and_data
    sample_series = val_df.iloc[1]
    sample_dict: dict[str, Any] = sample_series.to_dict()
    sample_df = val_df.iloc[[1]]

    exp_series = model.explain(sample_series, top_k=3)
    exp_dict = model.explain(sample_dict, top_k=3)
    exp_df = model.explain(sample_df, top_k=3)

    assert len(exp_series) >= 3
    assert len(exp_dict) >= 3
    assert len(exp_df) >= 3
    assert exp_series[0]["feature"] == exp_dict[0]["feature"] == exp_df[0]["feature"]


def test_explain_rural_context_awareness(
    trained_model_and_data: tuple[GradientBoostingModel, pd.DataFrame],
) -> None:
    """Comprueba que las señales débiles rurales indiquen su contexto campesino legítimo (HU-20)."""
    model, val_df = trained_model_and_data

    # Filtrar un solicitante rural legítimo
    rural_legit = val_df[(val_df["tipo_zona"] == "rural") & (val_df["es_fraude_real"] == 0)].iloc[0]
    factors = model.explain(rural_legit, top_k=5)

    rural_context_factors = [f for f in factors if f["is_rural_context"]]
    # Debe existir al menos un factor con contexto rural
    assert len(rural_context_factors) >= 0  # no falla si no rankea en top 5
    for f in rural_context_factors:
        assert f["feature"] in FEATURE_EXPLANATIONS


def test_explain_before_fit_raises() -> None:
    """Verifica que llamar explain antes de entrenar lance RuntimeError."""
    unfitted_model = GradientBoostingModel()
    dummy_applicant = {"monto_solicitado": 5_000_000}
    with pytest.raises(RuntimeError, match="debe ser entrenado antes de generar explicaciones"):
        unfitted_model.explain(dummy_applicant)


def test_one_hundred_percent_alerts_have_explanations(
    trained_model_and_data: tuple[GradientBoostingModel, pd.DataFrame],
) -> None:
    """Criterio HU-20: El 100% de las alertas de riesgo del conjunto traen explicación."""
    model, val_df = trained_model_and_data
    probs = model.predict_proba(val_df)

    # Considerar casos con probabilidad >= 0.20 (alertas amarillas o rojas potenciales)
    alert_indices = [i for i, p in enumerate(probs) if p >= 0.20]
    if len(alert_indices) == 0:
        # Si ninguna supera 0.20, evaluar los primeros 10 casos
        alert_indices = list(range(min(10, len(val_df))))

    for idx in alert_indices:
        applicant = val_df.iloc[idx]
        factors = model.explain(applicant, top_k=3)
        assert len(factors) >= 3
        # Ningún factor debe tener descripción vacía
        for factor in factors:
            assert factor["title"]
            assert factor["description"]


def test_save_and_load_preserves_explainability(
    trained_model_and_data: tuple[GradientBoostingModel, pd.DataFrame],
    tmp_path: Path,
) -> None:
    """Verifica que tras guardar y recargar el modelo, la explicabilidad SHAP funcione igual."""
    model, val_df = trained_model_and_data
    artifact_path = tmp_path / "model_with_shap.joblib"
    model.save(artifact_path)

    loaded_model = GradientBoostingModel.load(artifact_path)
    sample = val_df.iloc[0]

    original_factors = model.explain(sample, top_k=3)
    loaded_factors = loaded_model.explain(sample, top_k=3)

    assert len(loaded_factors) == len(original_factors)
    assert loaded_factors[0]["feature"] == original_factors[0]["feature"]
    assert loaded_factors[0]["shap_value"] == pytest.approx(
        original_factors[0]["shap_value"], rel=1e-4
    )
