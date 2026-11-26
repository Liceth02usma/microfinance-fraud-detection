"""Cálculo de la auditoría ética sobre el split de prueba (HU-04, HU-21).

Pipeline:
1. Carga `data/test.csv` (split estratificado por fraude + zona, semilla fija).
2. Evalúa cada fila con la fusión híbrida real (`HybridEngine.evaluate`,
   sin SHAP para no pagar ese costo en lote).
3. Clase positiva = alerta `rojo` (el semáforo con pisos por indicios fuertes).
4. Métricas globales (AUC, F1, Precisión, Recall) + FPR por grupo con IC 95%
   de Wilson (grupos pequeños) + paridad demográfica y Equalized Odds vía
   fairlearn + sugerencia de umbral equitativo (solo sugerencia, HU-19).

Supuestos éticos documentados (HU-04):
- `tipo_zona`, `genero`, `pertenencia_etnica` son **variables protegidas**:
  NO entran como predictor del fraude (solo como corte de auditoría); el
  usuario decide su uso y la justificación vive en la matriz de adquisición.
- La auditoría jamás modifica umbrales de producción por sí sola.
"""

from __future__ import annotations

import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.core.versions import active_model_version
from app.engines.hybrid import get_hybrid_engine, load_fusion_config
from app.schemas.ethics import (
    EthicsAuditResponse,
    GlobalMetrics,
    GroupFPR,
    ParityMetrics,
    ThresholdSuggestion,
)
from app.schemas.evaluation import EvaluationRequest

# <repo>/data/test.csv (backend/app/ethics → 3 niveles arriba al repo)
DEFAULT_DATA_DIR = Path(__file__).resolve().parents[3] / "data"

# Variables protegidas auditadas (HU-04) y su clasificación
PROTECTED_ATTRIBUTES = ("tipo_zona", "genero", "pertenencia_etnica")

# Tamaño mínimo para no marcar el IC como anecdótico (HU-21)
SMALL_GROUP_N = 30

# Banda de paridad de FPR meta (ratio max/min ≤ 1.25 ≈ [0.80, 1.25] invertido)
PARITY_BAND_MAX_RATIO = 1.25

# Cache: (mtime del CSV, sample_size) → respuesta
_cache: dict[tuple[float, int | None], EthicsAuditResponse] = {}


class AuditDataError(RuntimeError):
    """Datos o modelo de auditoría no disponibles (→ HTTP 503 amigable)."""


def _data_dir() -> Path:
    env = os.environ.get("DATA_DIR")
    return Path(env) if env else DEFAULT_DATA_DIR


def wilson_interval(successes: int, n: int, z: float = 1.96) -> tuple[float | None, float | None]:
    """IC 95% de Wilson para una proporción (grupos pequeños, HU-21)."""
    if n <= 0:
        return None, None
    p = successes / n
    denom = 1.0 + z * z / n
    center = (p + z * z / (2.0 * n)) / denom
    margin = z * math.sqrt(p * (1.0 - p) / n + z * z / (4.0 * n * n)) / denom
    low = 0.0 if successes == 0 else max(0.0, center - margin)
    high = 1.0 if successes == n else min(1.0, center + margin)
    return low, high


def _row_to_request(row: pd.Series) -> EvaluationRequest:
    """Convierte una fila del CSV en un EvaluationRequest del contrato."""
    bool_fields = [
        "es_estacional",
        "sin_historial",
        "vive_lejos",
        "sin_local_fijo",
        "sin_fiador",
        "cedula_otra_region",
        "celular_prepago",
        "sin_cuenta_bancaria",
        "factura_manual",
        "fotos_poco_convincentes",
        "sin_referencias_comerciales",
        "nombre_distinto_recibo",
        "negocio_pequeno_monto",
        "direccion_sin_georreferenciar",
        "cedula_alterada",
        "ingresos_inconsistentes",
        "factura_falsa",
        "referencias_falsas",
        "historial_adverso",
        "negocio_inconsistente",
    ]
    payload: dict[str, Any] = {
        "id_solicitud": str(row["id_solicitud"]),
        "tipo_zona": str(row["tipo_zona"]),
        "oficina": str(row["oficina"]),
        "genero": str(row["genero"]),
        "pertenencia_etnica": str(row["pertenencia_etnica"]),
        "producto_credito": str(row["producto_credito"]),
        "tipo_negocio": str(row["tipo_negocio"]),
        "monto_solicitado": float(row["monto_solicitado"]),
        "plazo_meses": int(row["plazo_meses"]),
        "ingresos_declarados": float(row["ingresos_declarados"]),
        "edad_solicitante": int(row["edad_solicitante"]),
        "antiguedad_negocio_meses": int(row.get("antiguedad_negocio_meses", 36) or 36),
    }
    for name in bool_fields:
        payload[name] = bool(int(row[name]))
    return EvaluationRequest(**payload)


def _fpr_stats(y_true: np.ndarray, y_pred: np.ndarray) -> tuple[int, int, float | None]:
    """(FP, n_negativos, FPR) sobre un subconjunto."""
    negatives = y_true == 0
    n_neg = int(negatives.sum())
    if n_neg == 0:
        return 0, 0, None
    fp = int(((y_pred == 1) & negatives).sum())
    return fp, n_neg, fp / n_neg


def _safe_auc(y_true: np.ndarray, scores: np.ndarray) -> float | None:
    if len(np.unique(y_true)) < 2:
        return None
    from sklearn.metrics import roc_auc_score

    return float(roc_auc_score(y_true, scores))


def _safe_prf(
    y_true: np.ndarray, y_pred: np.ndarray
) -> tuple[float | None, float | None, float | None]:
    """(precision, recall, f1) tolerando clases ausentes."""
    tp = int(((y_pred == 1) & (y_true == 1)).sum())
    fp = int(((y_pred == 1) & (y_true == 0)).sum())
    fn = int(((y_pred == 0) & (y_true == 1)).sum())
    precision = tp / (tp + fp) if (tp + fp) > 0 else None
    recall = tp / (tp + fn) if (tp + fn) > 0 else None
    if precision is None or recall is None or (precision + recall) == 0:
        f1 = None
    else:
        f1 = 2 * precision * recall / (precision + recall)
    return precision, recall, f1


def _fpr_ratio_band(fprs: dict[str, float | None]) -> tuple[float | None, bool | None]:
    """Ratio max/min de FPR entre grupos y si cae en la banda [.., 1.25]."""
    values = [v for v in fprs.values() if v is not None]
    if len(values) < 2 or min(values) <= 0:
        return None, None
    ratio = max(values) / min(values)
    return ratio, ratio <= PARITY_BAND_MAX_RATIO


def _parity_for_attribute(
    attribute: str,
    y_true: np.ndarray,
    y_pred: np.ndarray,
    groups: pd.Series,
) -> ParityMetrics:
    """Paridad demográfica + Equalized Odds (fairlearn) para una variable."""
    from fairlearn.metrics import (
        demographic_parity_difference,
        equalized_odds_difference,
    )

    rates = {
        str(g): float((y_pred[groups.values == g] == 1).mean())
        for g in pd.unique(groups)
        if (groups.values == g).any()
    }
    fprs: dict[str, float | None] = {}
    for g in pd.unique(groups):
        mask = groups.values == g
        _, _, fpr = _fpr_stats(y_true[mask], y_pred[mask])
        fprs[str(g)] = fpr

    def _diff(fn: Any) -> float | None:
        try:
            value = fn(y_true, y_pred, sensitive_features=groups)
            return float(value)
        except Exception:  # noqa: BLE001 — un grupo solo / datos degenerados
            return None

    ratio, in_band = _fpr_ratio_band(fprs)
    return ParityMetrics(
        attribute=attribute,
        demographic_parity_difference=_diff(demographic_parity_difference),
        equalized_odds_difference=_diff(equalized_odds_difference),
        selection_rates=rates,
        fpr_ratio_max_min=ratio,
        within_parity_band=in_band,
    )


def _suggest_threshold(
    y_true: np.ndarray,
    scores: np.ndarray,
    current: float,
    groups_zona: pd.Series,
) -> ThresholdSuggestion:
    """Busca el umbral (30–90, paso 5) que minimiza |FPR_rural − FPR_urbano|.

    Solo sugiere: aplicar el cambio exige bitácora HU-19 y recomputar la
    auditoría de equidad (HU-21).
    """
    rural = groups_zona.values == "rural"
    urban = groups_zona.values == "urbana"

    def gap_at(threshold: float) -> tuple[float | None, float | None]:
        pred = (scores >= threshold).astype(int)
        _, _, fpr_r = _fpr_stats(y_true[rural], pred[rural])
        _, _, fpr_u = _fpr_stats(y_true[urban], pred[urban])
        if fpr_r is None or fpr_u is None:
            return None, None
        return abs(fpr_r - fpr_u), None

    def recall_at(threshold: float) -> float | None:
        pred = (scores >= threshold).astype(int)
        _, recall, _ = _safe_prf(y_true, pred)
        return recall

    gap_current, _ = gap_at(current)
    best_t, best_gap = float(current), gap_current
    for t in range(30, 95, 5):
        gap, _ = gap_at(float(t))
        if gap is None:
            continue
        if best_gap is None or gap < best_gap - 1e-9:
            best_t, best_gap = float(t), gap

    rationale = (
        f"Se escanearon umbrales 30–90 (paso 5) minimizando la brecha "
        f"|FPR_rural − FPR_urbana| sobre el split de prueba. El umbral "
        f"sugerido ({best_t:.0f}) reduce la brecha de "
        f"{gap_current if gap_current is not None else float('nan'):.4f} a "
        f"{best_gap if best_gap is not None else float('nan'):.4f}. "
        "NO se aplica automáticamente: registrar en la bitácora de cambios "
        "(fecha, persona, motivo) y recomputar esta auditoría."
    )
    return ThresholdSuggestion(
        current_threshold=current,
        suggested_threshold=best_t,
        fpr_gap_at_current=gap_current,
        fpr_gap_at_suggested=best_gap,
        recall_at_current=recall_at(current),
        recall_at_suggested=recall_at(best_t),
        rationale=rationale,
    )


def _load_split(sample_size: int | None) -> tuple[pd.DataFrame, Path]:
    data_dir = _data_dir()
    csv_path = data_dir / "test.csv"
    if not csv_path.exists():
        raise AuditDataError(
            f"No se encontró el split de prueba en {csv_path}. "
            "Genere el dataset con POST /api/v1/data/generate."
        )
    df = pd.read_csv(csv_path)
    required = {"es_fraude_real", *PROTECTED_ATTRIBUTES, "id_solicitud"}
    missing = required - set(df.columns)
    if missing:
        raise AuditDataError(f"Columnas faltantes en {csv_path}: {sorted(missing)}")
    if sample_size is not None and 0 < sample_size < len(df):
        # Muestra estratificada por la etiqueta (misma fracción por grupo)
        # para conservar la proporción de fraudes del split.
        df = df.groupby("es_fraude_real", group_keys=False).sample(
            frac=sample_size / len(df),
            random_state=42,
        )
    return df.reset_index(drop=True), csv_path


def run_audit(sample_size: int | None = None) -> EthicsAuditResponse:
    """Ejecuta la auditoría ética completa (con cache por mtime del CSV).

    Lanza `AuditDataError` si faltan datos o el modelo ML; el route la
    traduce a un 503 con mensaje amigable.
    """
    df, csv_path = _load_split(sample_size)
    mtime = csv_path.stat().st_mtime
    key = (mtime, sample_size)
    if key in _cache:
        return _cache[key]

    engine = get_hybrid_engine()
    config = load_fusion_config()
    if engine.ml_model is None:
        raise AuditDataError(
            engine._ml_error or "Modelo ML no disponible para la auditoría."  # noqa: SLF001
        )

    scores = np.empty(len(df), dtype=float)
    preds = np.empty(len(df), dtype=int)
    for i, row in df.iterrows():
        result = engine.evaluate(_row_to_request(row), explain=False)
        scores[i] = result.risk_score
        preds[i] = 1 if result.semaforo.value == "rojo" else 0

    y_true = df["es_fraude_real"].to_numpy(dtype=int)
    precision, recall, f1 = _safe_prf(y_true, preds)
    accuracy = float((preds == y_true).mean()) if len(y_true) else None

    global_metrics = GlobalMetrics(
        n_samples=len(df),
        fraud_rate=float(y_true.mean()) if len(y_true) else 0.0,
        auc=_safe_auc(y_true, scores),
        f1=f1,
        precision=precision,
        recall=recall,
        accuracy=accuracy,
        alert_rate=float(preds.mean()) if len(preds) else 0.0,
    )

    notes: list[str] = []
    fpr_by_group: list[GroupFPR] = []
    parity: list[ParityMetrics] = []

    for attribute in PROTECTED_ATTRIBUTES:
        groups = df[attribute].astype(str)
        parity.append(_parity_for_attribute(attribute, y_true, preds, groups))
        for group in sorted(groups.unique()):
            mask = groups.values == group
            fp, n_neg, fpr = _fpr_stats(y_true[mask], preds[mask])
            ci_low, ci_high = wilson_interval(fp, n_neg) if fpr is not None else (None, None)
            n = int(mask.sum())
            warning = n < SMALL_GROUP_N
            if warning:
                notes.append(
                    f"Grupo pequeño: {attribute}={group} (n={n} < {SMALL_GROUP_N}); "
                    "interpretar el FPR con el IC 95% de Wilson."
                )
            fpr_by_group.append(
                GroupFPR(
                    attribute=attribute,
                    group=group,
                    n_samples=n,
                    n_actual_negative=n_neg,
                    n_false_positives=fp,
                    fpr=fpr,
                    fpr_ci_low=ci_low,
                    fpr_ci_high=ci_high,
                    selection_rate=float(preds[mask].mean()) if n else 0.0,
                    sample_size_warning=warning,
                )
            )

    threshold_suggestion = _suggest_threshold(
        y_true, scores, current=config.amarillo_max, groups_zona=df["tipo_zona"].astype(str)
    )

    notes.insert(
        0,
        "Variables protegidas: genero y pertenencia_etnica se usan SOLO como "
        "corte de auditoría. El modelo ML no recibe ninguna de las tres "
        "(tipo_zona, genero, pertenencia_etnica). tipo_zona sí condiciona la red "
        "bayesiana y las salvaguardas de reglas, solo para que las señales de "
        "informalidad rural no aumenten el riesgo; P(fraude) base es casi igual "
        "en ambas zonas (3,3 % rural, 3,8 % urbana).",
    )
    notes.append(
        "Clase positiva = alerta rojo (semáforo con pisos por indicios fuertes). "
        "La auditoría no modifica umbrales de producción."
    )

    response = EthicsAuditResponse(
        generated_at=datetime.now(timezone.utc).isoformat(),
        dataset_path=str(csv_path),
        model_version=active_model_version(),
        positive_class="rojo",
        global_metrics=global_metrics,
        fpr_by_group=fpr_by_group,
        parity=parity,
        threshold_suggestion=threshold_suggestion,
        notes=notes,
    )
    _cache[key] = response
    return response


def clear_cache() -> None:
    """Invalida la cache de auditoría (tests y regeneración de datos)."""
    _cache.clear()
