"""Script para entrenar y evaluar el modelo de línea base de regresión logística (HU-14).

Lee las particiones data/train.csv y data/val.csv, entrena el modelo con ponderación
de clases balanceada y guarda el artefacto versionado y sus métricas en models/.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import pandas as pd

from app.engines.ml_model import BaselineLogisticModel


def train_and_evaluate_baseline(
    data_dir: Path,
    models_dir: Path,
    random_state: int = 42,
) -> tuple[BaselineLogisticModel, dict[str, Any]]:
    """Entrena la línea base con el conjunto de train y evalúa métricas sobre val.

    Retorna la instancia del modelo entrenado y el diccionario de métricas.
    """
    train_path = data_dir / "train.csv"
    val_path = data_dir / "val.csv"

    if not train_path.exists() or not val_path.exists():
        raise FileNotFoundError(
            f"No se encontraron las particiones en {data_dir}. "
            "Asegúrese de ejecutar app.data.generate_dataset primero."
        )

    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)

    y_train = train_df["es_fraude_real"]
    y_val = val_df["es_fraude_real"]

    model = BaselineLogisticModel(random_state=random_state)
    model.fit(train_df, y_train)

    metrics = model.evaluate(val_df, y_val)

    # Guardar en models/
    artifact_path = models_dir / "baseline_logistic.joblib"
    model.save(artifact_path, metrics=metrics)

    return model, metrics


def main() -> None:
    """Función de entrada CLI para entrenar y evaluar la línea base."""
    parser = argparse.ArgumentParser(
        description="Entrenamiento y evaluación de línea base ML (HU-14)"
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="../data",
        help="Directorio donde residen train.csv y val.csv (default: ../data)",
    )
    parser.add_argument(
        "--models-dir",
        type=str,
        default="../models",
        help="Directorio de destino para artefactos del modelo (default: ../models)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Semilla determinista (default: 42)",
    )

    args = parser.parse_args()
    data_path = Path(args.data_dir).resolve()
    models_path = Path(args.models_dir).resolve()

    _, metrics = train_and_evaluate_baseline(
        data_dir=data_path,
        models_dir=models_path,
        random_state=args.seed,
    )

    print("=" * 60)
    print("MÉTRICAS DE LÍNEA BASE EN VALIDACIÓN (HU-14):")
    print(f"  * Versión:    {metrics['model_version']}")
    print(f"  * AUC-ROC:    {metrics['auc']}")
    print(f"  * F1-Score:   {metrics['f1']}")
    print(f"  * Precisión:  {metrics['precision']}")
    print(f"  * Recall:     {metrics['recall']}")
    print(f"  * Brier Loss: {metrics['brier_score']}")
    print(f"  * Muestras:   {metrics['samples_evaluated']}")
    print(f"  * Matriz CM:  {metrics['confusion_matrix']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
