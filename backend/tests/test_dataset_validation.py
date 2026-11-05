"""Pruebas unitarias para la validación y partición estratificada del dataset (HU-08)."""

from pathlib import Path

import pandas as pd
import pytest

from app.data.generator import SyntheticDataGenerator
from app.data.schema import GeneratorConfig
from app.data.splitter import DatasetSplitter
from app.data.validator import DatasetValidator


@pytest.fixture
def sample_df() -> pd.DataFrame:
    """Fixture que produce un DataFrame sintético válido para pruebas."""
    config = GeneratorConfig(seed=42, n_records=1000, fraud_rate=0.035)
    generator = SyntheticDataGenerator(config=config)
    return generator.generate_records()


def test_validator_accepts_valid_dataset(sample_df: pd.DataFrame) -> None:
    """Comprueba que un dataset bien formado sea aceptado sin errores."""
    result = DatasetValidator.validate(sample_df)
    assert result.is_valid is True
    assert len(result.errors) == 0
    assert result.summary["total_records"] == 1000
    assert result.summary["total_nulls"] == 0
    assert "VALID" in repr(result)


def test_validator_detects_missing_column(sample_df: pd.DataFrame) -> None:
    """Verifica que se detecten columnas requeridas faltantes."""
    corrupted_df = sample_df.drop(columns=["es_fraude_real"])
    result = DatasetValidator.validate(corrupted_df)
    assert result.is_valid is False
    assert any("es_fraude_real" in err for err in result.errors)


def test_validator_detects_null_values(sample_df: pd.DataFrame) -> None:
    """Verifica que se detecten valores nulos inesperados."""
    corrupted_df = sample_df.copy()
    corrupted_df.loc[0, "monto_solicitado"] = None
    result = DatasetValidator.validate(corrupted_df)
    assert result.is_valid is False
    assert any("monto_solicitado" in err for err in result.errors)


def test_validator_detects_invalid_numeric_ranges(sample_df: pd.DataFrame) -> None:
    """Verifica detección de montos negativos o edades fuera de rango."""
    corrupted_df = sample_df.copy()
    corrupted_df.loc[0, "monto_solicitado"] = -500_000
    corrupted_df.loc[1, "edad_solicitante"] = 12  # menor de edad
    result = DatasetValidator.validate(corrupted_df)
    assert result.is_valid is False
    assert any("menores o iguales a cero" in err for err in result.errors)
    assert any("18-100" in err for err in result.errors)


def test_validator_detects_non_binary_signals(sample_df: pd.DataFrame) -> None:
    """Verifica detección de valores no binarios en señales débiles o indicios."""
    corrupted_df = sample_df.copy()
    corrupted_df.loc[0, "celular_prepago"] = 5
    result = DatasetValidator.validate(corrupted_df)
    assert result.is_valid is False
    assert any("valores no binarios" in err for err in result.errors)


def test_validator_detects_invalid_fraud_rate(sample_df: pd.DataFrame) -> None:
    """Verifica que se detecte una tasa de fraude anómala."""
    corrupted_df = sample_df.copy()
    corrupted_df["es_fraude_real"] = 1  # 100% de fraude
    result = DatasetValidator.validate(corrupted_df)
    assert result.is_valid is False
    assert any("Tasa de fraude fuera de rango" in err for err in result.errors)


def test_splitter_invalid_ratios() -> None:
    """Comprueba que se rechacen particiones cuyas razones no sumen 1.0."""
    with pytest.raises(ValueError, match="Las proporciones deben sumar 1.0"):
        DatasetSplitter(train_ratio=0.6, val_ratio=0.2, test_ratio=0.1)


def test_splitter_stratified_distribution(sample_df: pd.DataFrame) -> None:
    """Verifica que train, val y test mantengan proporciones equivalentes de fraude y zona."""
    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    train_df, val_df, test_df = splitter.split(sample_df)

    assert len(train_df) == 700
    assert len(val_df) == 150
    assert len(test_df) == 150

    global_fraud = sample_df["es_fraude_real"].mean()
    global_rural = (sample_df["tipo_zona"] == "rural").mean()

    # Diferencias de estratificación menores a 1.5%
    for subset in [train_df, val_df, test_df]:
        assert abs(subset["es_fraude_real"].mean() - global_fraud) < 0.015
        assert abs((subset["tipo_zona"] == "rural").mean() - global_rural) < 0.015


def test_splitter_split_and_save(sample_df: pd.DataFrame, tmp_path: Path) -> None:
    """Comprueba la persistencia correcta de train.csv, val.csv y test.csv."""
    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)
    train_p, val_p, test_p = splitter.split_and_save(sample_df, tmp_path)

    assert train_p.exists()
    assert val_p.exists()
    assert test_p.exists()

    df_train = pd.read_csv(train_p)
    df_val = pd.read_csv(val_p)
    df_test = pd.read_csv(test_p)

    assert len(df_train) == 700
    assert len(df_val) == 150
    assert len(df_test) == 150
