"""Script de línea de comandos para generar, validar y particionar los datasets sintéticos.

Genera el dataset principal con sesgo rural controlado (HU-06 y HU-07),
lo valida rigurosamente (HU-08), genera las particiones train/val/test estratificadas (HU-08)
y crea el dataset de control sin sesgo para la evaluación ética (HU-07).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from app.data.generator import SyntheticDataGenerator
from app.data.schema import GeneratorConfig
from app.data.splitter import DatasetSplitter
from app.data.validator import DatasetValidator


def generate_validate_and_split_datasets(
    output_dir: Path,
    n_records: int = 15000,
    fraud_rate: float = 0.035,
    seed: int = 42,
) -> tuple[Path, Path, Path, Path, Path]:
    """Genera, valida y particiona los datasets en disco.

    Retorna las rutas a (main, train, val, test, control).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    config = GeneratorConfig(n_records=n_records, fraud_rate=fraud_rate, seed=seed)
    generator = SyntheticDataGenerator(config=config)

    # 1. Dataset principal con sesgo rural controlado (HU-06 y HU-07)
    df_main = generator.generate_records(inject_rural_bias=True)

    # 2. Validación estricta del dataset (HU-08)
    val_result = DatasetValidator.validate(df_main)
    if not val_result.is_valid:
        error_msg = "; ".join(val_result.errors)
        raise ValueError(f"Fallo en validación de datos: {error_msg}")

    main_path = output_dir / "synthetic_applicants.csv"
    df_main.to_csv(main_path, index=False)

    # 3. Partición estratificada por fraude y zona (HU-08)
    splitter = DatasetSplitter(train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=seed)
    train_path, val_path, test_path = splitter.split_and_save(df_main, output_dir)

    # 4. Dataset de control sin sesgo rural (HU-07)
    generator.reset_seed(seed + 1000)
    df_control = generator.generate_records(inject_rural_bias=False)
    control_path = output_dir / "synthetic_applicants_control.csv"
    df_control.to_csv(control_path, index=False)

    return main_path, train_path, val_path, test_path, control_path


def main() -> None:
    """Función de entrada para ejecución por línea de comandos."""
    parser = argparse.ArgumentParser(
        description="Generador, validador y particionador de datos sintéticos CrediConfianza"
    )
    parser.add_argument(
        "--n-records",
        type=int,
        default=15000,
        help="Número de registros sintéticos a generar (default: 15000)",
    )
    parser.add_argument(
        "--fraud-rate",
        type=float,
        default=0.035,
        help="Tasa de fraude real configurable (default: 0.035)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Semilla determinista (default: 42)",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="../data",
        help="Directorio de destino para los archivos CSV (default: ../data)",
    )

    args = parser.parse_args()
    output_path = Path(args.output_dir).resolve()
    main_f, train_f, val_f, test_f, control_f = generate_validate_and_split_datasets(
        output_dir=output_path,
        n_records=args.n_records,
        fraud_rate=args.fraud_rate,
        seed=args.seed,
    )
    print(f"[OK] Dataset principal: {main_f}")
    print(f"[OK] Partición Train (70%): {train_f}")
    print(f"[OK] Partición Val (15%): {val_f}")
    print(f"[OK] Partición Test (15%): {test_f}")
    print(f"[OK] Dataset Control: {control_f}")


if __name__ == "__main__":
    main()
