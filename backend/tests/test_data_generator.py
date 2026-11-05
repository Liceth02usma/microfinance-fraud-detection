"""Pruebas unitarias para el generador de solicitantes sintéticos (HU-06 y HU-07)."""

import sys
from pathlib import Path

import pandas as pd
import pytest

from app.data.generate_dataset import generate_validate_and_split_datasets, main
from app.data.generator import SyntheticDataGenerator
from app.data.schema import (
    RURAL_BRANCHES,
    STRONG_INDICATORS,
    URBAN_BRANCHES,
    WEAK_SIGNALS,
    CreditProduct,
    GeneratorConfig,
    ZoneType,
)


@pytest.fixture
def base_generator() -> SyntheticDataGenerator:
    """Fixture que provee un generador con configuración pequeña para pruebas rápidas."""
    config = GeneratorConfig(seed=42, n_records=500, fraud_rate=0.04)
    return SyntheticDataGenerator(config=config)


def test_generator_deterministic_seed(base_generator: SyntheticDataGenerator) -> None:
    """Verifica que dada la misma semilla, el dataset producido es exactamente idéntico."""
    df1 = base_generator.generate_records()

    base_generator.reset_seed(42)
    df2 = base_generator.generate_records()

    pd.testing.assert_frame_equal(df1, df2)


def test_generator_no_null_values(base_generator: SyntheticDataGenerator) -> None:
    """Comprueba que no existan valores nulos en ninguna columna."""
    df = base_generator.generate_records()
    assert df.isnull().sum().sum() == 0


def test_generator_branches_coverage(base_generator: SyntheticDataGenerator) -> None:
    """Comprueba que se generen registros para las 14 oficinas (7 urbanas y 7 rurales)."""
    df = base_generator.generate_records(n_records=1500)
    branches_in_df = set(df["oficina"].unique())

    all_expected_branches = set(URBAN_BRANCHES + RURAL_BRANCHES)
    assert branches_in_df == all_expected_branches

    # Verificar que las oficinas urbanas correspondan a tipo_zona urbana y viceversa
    urban_df = df[df["tipo_zona"] == ZoneType.URBAN.value]
    rural_df = df[df["tipo_zona"] == ZoneType.RURAL.value]

    assert set(urban_df["oficina"].unique()).issubset(set(URBAN_BRANCHES))
    assert set(rural_df["oficina"].unique()).issubset(set(RURAL_BRANCHES))


def test_generator_credit_products_coverage(base_generator: SyntheticDataGenerator) -> None:
    """Comprueba que las 4 líneas de crédito estén presentes."""
    df = base_generator.generate_records()
    products_in_df = set(df["producto_credito"].unique())
    expected_products = {p.value for p in CreditProduct}
    assert products_in_df == expected_products


def test_generator_signals_and_indicators_present(base_generator: SyntheticDataGenerator) -> None:
    """Verifica que las 13 señales débiles y 6 indicios fuertes estén en el dataset."""
    df = base_generator.generate_records()
    for signal in WEAK_SIGNALS:
        assert signal in df.columns, f"Falta la señal débil: {signal}"
        assert set(df[signal].unique()).issubset({0, 1})

    for indicator in STRONG_INDICATORS:
        assert indicator in df.columns, f"Falta el indicio fuerte: {indicator}"
        assert set(df[indicator].unique()).issubset({0, 1})


def test_fraud_rate_within_expected_range() -> None:
    """Comprueba que la tasa de fraude global esté dentro de los parámetros esperados (2% a 5%)."""
    config = GeneratorConfig(seed=123, n_records=2500, fraud_rate=0.035)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records()

    fraud_rate = df["es_fraude_real"].mean()
    assert 0.02 <= fraud_rate <= 0.05

    # Tasa similar en zona rural y urbana (HU-07)
    rural_fraud = df[df["tipo_zona"] == ZoneType.RURAL.value]["es_fraude_real"].mean()
    urban_fraud = df[df["tipo_zona"] == ZoneType.URBAN.value]["es_fraude_real"].mean()
    assert abs(rural_fraud - urban_fraud) < 0.02


def test_rural_weak_signals_higher_in_legitimate_applicants() -> None:
    """Verifica mayor frecuencia de señales débiles en ruralidad para solicitantes legítimos."""
    config = GeneratorConfig(seed=42, n_records=1500, fraud_rate=0.03)
    generator = SyntheticDataGenerator(config=config)
    df = generator.generate_records(inject_rural_bias=True)

    legit_df = df[df["es_fraude_real"] == 0]
    rural_legit = legit_df[legit_df["tipo_zona"] == ZoneType.RURAL.value]
    urban_legit = legit_df[legit_df["tipo_zona"] == ZoneType.URBAN.value]

    # En la economía rural, prepago, factura manual y sin georreferencia son más comunes
    assert rural_legit["celular_prepago"].mean() > urban_legit["celular_prepago"].mean()
    assert (
        rural_legit["direccion_sin_georreferenciar"].mean()
        > urban_legit["direccion_sin_georreferenciar"].mean()
    )
    assert rural_legit["factura_manual"].mean() > urban_legit["factura_manual"].mean()


def test_generate_validate_and_split_datasets_cli(tmp_path: Path) -> None:
    """Verifica la persistencia de datasets en disco (principal, particiones y control)."""
    main_f, train_f, val_f, test_f, control_f = generate_validate_and_split_datasets(
        output_dir=tmp_path,
        n_records=300,
        fraud_rate=0.04,
        seed=99,
    )

    for file_path in [main_f, train_f, val_f, test_f, control_f]:
        assert file_path.exists()

    df_main = pd.read_csv(main_f)
    df_train = pd.read_csv(train_f)
    df_val = pd.read_csv(val_f)
    df_test = pd.read_csv(test_f)
    df_control = pd.read_csv(control_f)

    assert len(df_main) == 300
    assert len(df_train) == 210
    assert len(df_val) == 45
    assert len(df_test) == 45
    assert len(df_control) == 300
    assert "es_fraude_real" in df_main.columns
    assert "es_fraude_real" in df_control.columns


def test_generate_dataset_main_cli(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifica la ejecución de la función main del CLI con argumentos."""
    test_args = [
        "generate_dataset.py",
        "--n-records",
        "300",
        "--fraud-rate",
        "0.04",
        "--seed",
        "77",
        "--output-dir",
        str(tmp_path),
    ]
    monkeypatch.setattr(sys, "argv", test_args)
    main()

    assert (tmp_path / "synthetic_applicants.csv").exists()
    assert (tmp_path / "train.csv").exists()
    assert (tmp_path / "val.csv").exists()
    assert (tmp_path / "test.csv").exists()
    assert (tmp_path / "synthetic_applicants_control.csv").exists()
