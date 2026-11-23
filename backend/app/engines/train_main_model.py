"""Script para entrenar y evaluar el modelo principal Gradient Boosting con calibración (HU-15).

Lee data/train.csv y data/val.csv, realiza validación cruzada, ajusta el modelo
calibrado con CalibratedClassifierCV y compara los resultados frente a la línea base.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd

from app.engines.ml_model import GradientBoostingModel


def train_and_evaluate_main_model(
    data_dir: Path,
    models_dir: Path,
    random_state: int = 42,
    calibration_method: str = "sigmoid",
) -> tuple[GradientBoostingModel, dict[str, Any]]:
    """Entrena el modelo principal Gradient Boosting y evalúa métricas en validación."""
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

    model = GradientBoostingModel(
        random_state=random_state,
        calibration_method=calibration_method,
    )
    model.fit(train_df, y_train)

    metrics = model.evaluate(val_df, y_val)

    # Guardar artefactos en models/
    artifact_path = models_dir / "main_gradient_boosting.joblib"
    model.save(artifact_path, metrics=metrics)

    return model, metrics


def main() -> None:
    """Función de entrada CLI para entrenar y evaluar el modelo principal (HU-15)."""
    parser = argparse.ArgumentParser(
        description="Entrenamiento y calibración del modelo principal Gradient Boosting (HU-15)"
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
    parser.add_argument(
        "--calibration-method",
        type=str,
        default="sigmoid",
        choices=["sigmoid", "isotonic"],
        help="Método de calibración (default: sigmoid)",
    )

    args = parser.parse_args()
    data_path = Path(args.data_dir).resolve()
    models_path = Path(args.models_dir).resolve()

    _, metrics = train_and_evaluate_main_model(
        data_dir=data_path,
        models_dir=models_path,
        random_state=args.seed,
        calibration_method=args.calibration_method,
    )

    # Cargar métricas de línea base para comparación
    baseline_metrics_path = models_path / "baseline_logistic_metrics.json"
    baseline_metrics: dict[str, Any] | None = None
    if baseline_metrics_path.exists():
        with open(baseline_metrics_path, encoding="utf-8") as f:
            baseline_metrics = json.load(f)

    cv_auc = f"{metrics['cv_metrics']['cv_auc_mean']} (+/- {metrics['cv_metrics']['cv_auc_std']})"
    cv_f1 = f"{metrics['cv_metrics']['cv_f1_mean']} (+/- {metrics['cv_metrics']['cv_f1_std']})"

    print("=" * 72)
    print("MÉTRICAS DEL MODELO PRINCIPAL EN VALIDACIÓN (HU-15):")
    print(f"  * Versión:             {metrics['model_version']}")
    print(f"  * Calibración:         {metrics['hyperparameters']['calibration_method']}")
    print(f"  * CV AUC-ROC (train):  {cv_auc}")
    print(f"  * CV F1-Score (train): {cv_f1}")
    print(f"  * AUC-ROC (val):       {metrics['auc']}")
    print(f"  * F1-Score (val):      {metrics['f1']}")
    print(f"  * Precisión (val):     {metrics['precision']}")
    print(f"  * Recall (val):        {metrics['recall']}")
    print(f"  * Brier Score Loss:    {metrics['brier_score']}")
    print(f"  * Matriz CM:           {metrics['confusion_matrix']}")
    print("=" * 72)

    if baseline_metrics:
        b_auc = str(baseline_metrics.get("auc", "N/A"))
        b_f1 = str(baseline_metrics.get("f1", "N/A"))
        b_prec = str(baseline_metrics.get("precision", "N/A"))
        b_rec = str(baseline_metrics.get("recall", "N/A"))
        b_brier = str(baseline_metrics.get("brier_score", "N/A"))

        print("\nCOMPARATIVA CON LÍNEA BASE (HU-14 vs HU-15):")
        print("  Métrica     | Línea Base (Reg. Log)   | Modelo Principal (XGB Calibrado)")
        print("  ----------- | ----------------------- | --------------------------------")
        print(f"  AUC-ROC     | {b_auc:<23} | {metrics['auc']}")
        print(f"  F1-Score    | {b_f1:<23} | {metrics['f1']}")
        print(f"  Precisión   | {b_prec:<23} | {metrics['precision']}")
        print(f"  Recall      | {b_rec:<23} | {metrics['recall']}")
        print(f"  Brier Score | {b_brier:<23} | {metrics['brier_score']}")
        print("=" * 72)


if __name__ == "__main__":
    main()
