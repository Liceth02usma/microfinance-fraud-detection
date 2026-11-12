"""Motores de razonamiento e inferencia de CrediConfianza (Reglas, Bayesiano, ML e Híbrido)."""

from app.engines.explainer import FEATURE_EXPLANATIONS, ShapExplainer
from app.engines.ml_model import BaselineLogisticModel, GradientBoostingModel
from app.engines.train_baseline import train_and_evaluate_baseline
from app.engines.train_main_model import train_and_evaluate_main_model

__all__ = [
    "FEATURE_EXPLANATIONS",
    "BaselineLogisticModel",
    "GradientBoostingModel",
    "ShapExplainer",
    "train_and_evaluate_baseline",
    "train_and_evaluate_main_model",
]
