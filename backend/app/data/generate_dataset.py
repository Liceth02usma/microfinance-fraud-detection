"""Script de línea de comandos para generar y persistir los datasets sintéticos.

Genera el dataset principal con sesgo rural controlado (HU-06 y HU-07)
y el dataset de control sin sesgo para evaluación ética (HU-07).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from app.data.generator import SyntheticDataGenerator
from app.data.schema import GeneratorConfig


def generate_and_save_datasets(
    output_dir: Path,
    n_records: int = 15000,
    fraud_rate: float = 0.035,
    seed: int = 42,
) -> tuple[Path, Path]:
    """Genera y guarda en disco tanto el dataset con sesgo rural como el dataset de control.

    Retorna las rutas a los archivos generados.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    config = GeneratorConfig(n_records=n_records, fraud_rate=fraud_rate, seed=seed)
    generator = SyntheticDataGenerator(config=config)

    # 1. Dataset principal con sesgo rural controlado (HU-06 y HU-07)
    df_main = generator.generate_records(inject_rural_bias=True)
    main_path = output_dir / "synthetic_applicants.csv"
    df_main.to_csv(main_path, index=False)

    # 2. Dataset de control sin sesgo rural (HU-07)
    generator.reset_seed(seed + 1000)
    df_control = generator.generate_records(inject_rural_bias=False)
    control_path = output_dir / "synthetic_applicants_control.csv"
    df_control.to_csv(control_path, index=False)

    return main_path, control_path


def main() -> None:
    """Función de entrada para ejecución por línea de comandos."""
    parser = argparse.ArgumentParser(
        description="Generador de solicitantes sintéticos de microcrédito CrediConfianza"
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
    main_file, control_file = generate_and_save_datasets(
        output_dir=output_path,
        n_records=args.n_records,
        fraud_rate=args.fraud_rate,
        seed=args.seed,
    )
    print(f"Dataset principal generado exitosamente en: {main_file}")
    print(f"Dataset de control generado exitosamente en: {control_file}")


if __name__ == "__main__":
    main()
