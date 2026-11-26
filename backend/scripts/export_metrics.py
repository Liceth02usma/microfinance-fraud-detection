"""Calcula los resultados reales del sistema y los exporta (HU-16, HU-21, HU-23).

Todas las cifras que muestra el artículo científico de la interfaz salen de
este script; ninguna se escribe a mano. Se ejecuta sobre el split de prueba
(`data/test.csv`) con los modelos entrenados en `models/` y produce:

- `fairness/metricas_resultados.json`: resultados completos (fuente de verdad).
- `fairness/reporte_auditoria.md`: reporte de auditoría legible (HU-23).
- `frontend/src/data/metricsSnapshot.json`: copia que importa el artículo.

Configuraciones comparadas (HU-16, prueba de ablación):
1. Lista de chequeo manual (simulada): sospechoso si hay >= 3 señales débiles
   o algún indicio fuerte. Representa el proceso actual descrito en el
   enunciado, en el que las señales débiles bastan para marcar un caso.
2. Solo reglas, solo red bayesiana, solo XGBoost y regresión logística base:
   alerta si el puntaje del motor es >= 0,5.
3. Sistema híbrido: alerta = semáforo rojo (umbrales y pisos de fusion.yaml).

Uso (desde backend/):
    uv run python scripts/export_metrics.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yaml
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

REPO_DIR = BACKEND_DIR.parent

from app.core.versions import active_model_version  # noqa: E402
from app.data.schema import STRONG_INDICATORS, WEAK_SIGNALS  # noqa: E402
from app.engines import bayesian  # noqa: E402
from app.engines.hybrid import get_hybrid_engine, load_fusion_config  # noqa: E402
from app.engines.ml_model import BaselineLogisticModel  # noqa: E402
from app.ethics.audit import _row_to_request, run_audit  # noqa: E402

DATA_DIR = REPO_DIR / "data"
MODELS_DIR = REPO_DIR / "models"
FAIRNESS_DIR = REPO_DIR / "fairness"
FRONTEND_SNAPSHOT = REPO_DIR / "frontend" / "src" / "data" / "metricsSnapshot.json"

CHECKLIST_WEAK_MIN = 3

WEAK_LABELS = {
    "sin_historial": "Sin historial crediticio",
    "vive_lejos": "Vive lejos",
    "sin_local_fijo": "Sin local fijo",
    "sin_fiador": "Sin fiador",
    "cedula_otra_region": "Cédula de otra región",
    "celular_prepago": "Celular prepago",
    "sin_cuenta_bancaria": "Sin cuenta bancaria",
    "factura_manual": "Factura manual",
    "fotos_poco_convincentes": "Fotos poco convincentes",
    "sin_referencias_comerciales": "Sin referencias comerciales",
    "nombre_distinto_recibo": "Nombre distinto al del recibo",
    "negocio_pequeno_monto": "Negocio pequeño para el monto",
    "direccion_sin_georreferenciar": "Dirección sin georreferenciar",
}
STRONG_LABELS = {
    "cedula_alterada": "Cédula alterada",
    "ingresos_inconsistentes": "Ingresos inconsistentes",
    "factura_falsa": "Factura falsa",
    "referencias_falsas": "Referencias falsas",
    "historial_adverso": "Historial adverso",
    "negocio_inconsistente": "Negocio inconsistente",
}


def _r(value: float | None, digits: int = 4) -> float | None:
    return None if value is None or np.isnan(value) else round(float(value), digits)


def _fpr(y: np.ndarray, pred: np.ndarray, mask: np.ndarray | None = None) -> float | None:
    if mask is not None:
        y, pred = y[mask], pred[mask]
    neg = y == 0
    return None if neg.sum() == 0 else float(((pred == 1) & neg).sum() / neg.sum())


def _config_metrics(
    name: str,
    description: str,
    y: np.ndarray,
    pred: np.ndarray,
    score: np.ndarray | None,
    rural: np.ndarray,
) -> dict[str, Any]:
    fpr_r = _fpr(y, pred, rural)
    fpr_u = _fpr(y, pred, ~rural)
    return {
        "name": name,
        "description": description,
        "auc": _r(roc_auc_score(y, score)) if score is not None else None,
        "precision": _r(precision_score(y, pred, zero_division=0)),
        "recall": _r(recall_score(y, pred, zero_division=0)),
        "f1": _r(f1_score(y, pred, zero_division=0)),
        "fpr": _r(_fpr(y, pred)),
        "fpr_rural": _r(fpr_r),
        "fpr_urbana": _r(fpr_u),
        "false_positives_rural": int(((pred == 1) & (y == 0) & rural).sum()),
        "false_positives_urbana": int(((pred == 1) & (y == 0) & ~rural).sum()),
        "fpr_gap": _r(abs(fpr_r - fpr_u)) if fpr_r is not None and fpr_u is not None else None,
        "alert_rate": _r(float(pred.mean())),
    }


def _likelihood_ratios() -> list[dict[str, Any]]:
    """LR = P(señal | fraude, zona) / P(señal | no fraude, zona), de las CPDs reales."""
    rows: list[dict[str, Any]] = []
    for name, (p_no, p_si) in bayesian.STRONG_CPDS.items():
        rows.append(
            {
                "signal": name,
                "label": STRONG_LABELS[name],
                "kind": "fuerte",
                "lr_rural": _r(p_si / p_no, 1),
                "lr_urbana": _r(p_si / p_no, 1),
            }
        )
    for name, table in bayesian.WEAK_CPDS.items():
        rows.append(
            {
                "signal": name,
                "label": WEAK_LABELS[name],
                "kind": "debil",
                "lr_rural": _r(table[(1, "rural")] / table[(0, "rural")], 2),
                "lr_urbana": _r(table[(1, "urbana")] / table[(0, "urbana")], 2),
            }
        )
    return rows


def _rules_summary() -> dict[str, Any]:
    data = yaml.safe_load((REPO_DIR / "knowledge" / "reglas.yaml").read_text(encoding="utf-8"))
    rules = data.get("reglas", [])
    by_cat: dict[str, int] = {}
    for rule in rules:
        by_cat[rule["categoria"]] = by_cat.get(rule["categoria"], 0) + 1
    return {
        "version": str(data.get("version")),
        "total": len(rules),
        "by_category": by_cat,
        "examples": [
            {
                "id": r["id"],
                "categoria": r["categoria"],
                "condicion": r["condicion"],
                "peso": float(r["peso"]),
                "tope_rural": r.get("tope_rural"),
                "justificacion": r["justificacion"],
            }
            for r in rules
            if r["id"]
            in {"R-STRONG-01", "R-STRONG-02", "R-WEAK-06", "R-WEAK-07", "R-WEAK-13", "R-SAFE-01"}
        ],
    }


def _dataset_summary(full: pd.DataFrame) -> dict[str, Any]:
    legit = full[full["es_fraude_real"] == 0]
    prevalence = []
    for name in WEAK_SIGNALS:
        rural = float(legit.loc[legit["tipo_zona"] == "rural", name].mean())
        urbana = float(legit.loc[legit["tipo_zona"] == "urbana", name].mean())
        prevalence.append(
            {"signal": name, "label": WEAK_LABELS[name], "rural": _r(rural), "urbana": _r(urbana)}
        )
    return {
        "n_total": int(len(full)),
        "fraud_rate": _r(float(full["es_fraude_real"].mean())),
        "fraud_rate_rural": _r(
            float(full.loc[full["tipo_zona"] == "rural", "es_fraude_real"].mean())
        ),
        "fraud_rate_urbana": _r(
            float(full.loc[full["tipo_zona"] == "urbana", "es_fraude_real"].mean())
        ),
        "share_rural": _r(float((full["tipo_zona"] == "rural").mean())),
        "weak_signal_prevalence_legit": prevalence,
    }


def compute() -> dict[str, Any]:
    """Ejecuta todas las configuraciones sobre el split de prueba."""
    test = pd.read_csv(DATA_DIR / "test.csv")
    full = pd.read_csv(DATA_DIR / "synthetic_applicants.csv")
    y = test["es_fraude_real"].to_numpy(dtype=int)
    rural = (test["tipo_zona"] == "rural").to_numpy()

    engine = get_hybrid_engine()
    config = load_fusion_config()
    n = len(test)
    s_rules = np.empty(n)
    s_bayes = np.empty(n)
    s_ml = np.empty(n)
    s_hybrid = np.empty(n)
    semaforo = np.empty(n, dtype=object)
    for i, row in test.iterrows():
        res = engine.evaluate(_row_to_request(row), explain=False)
        s_rules[i] = res.rules.subscore
        s_bayes[i] = res.bayesian_probability or 0.0
        s_ml[i] = res.ml_probability or 0.0
        s_hybrid[i] = res.risk_score
        semaforo[i] = res.semaforo.value

    baseline = BaselineLogisticModel.load(MODELS_DIR / "baseline_logistic.joblib")
    s_logit = baseline.predict_proba(test)

    weak_count = test[WEAK_SIGNALS].sum(axis=1).to_numpy()
    strong_count = test[STRONG_INDICATORS].sum(axis=1).to_numpy()
    checklist = ((weak_count >= CHECKLIST_WEAK_MIN) | (strong_count > 0)).astype(int)
    pred_hybrid = (semaforo == "rojo").astype(int)

    configs = [
        _config_metrics(
            "Lista de chequeo manual (simulada)",
            f"Sospechoso con >= {CHECKLIST_WEAK_MIN} señales débiles o algún indicio fuerte.",
            y,
            checklist,
            None,
            rural,
        ),
        _config_metrics(
            "Solo reglas expertas",
            "Subpuntaje de reglas >= 0,5.",
            y,
            (s_rules >= 0.5).astype(int),
            s_rules,
            rural,
        ),
        _config_metrics(
            "Solo red bayesiana",
            "P(fraude | evidencia) >= 0,5.",
            y,
            (s_bayes >= 0.5).astype(int),
            s_bayes,
            rural,
        ),
        _config_metrics(
            "Regresión logística (línea base ML)",
            "Probabilidad >= 0,5.",
            y,
            (s_logit >= 0.5).astype(int),
            s_logit,
            rural,
        ),
        _config_metrics(
            "Solo XGBoost calibrado",
            "Probabilidad >= 0,5.",
            y,
            (s_ml >= 0.5).astype(int),
            s_ml,
            rural,
        ),
        _config_metrics(
            "Sistema híbrido (reglas + bayes + ML)",
            "Semáforo rojo según umbrales y pisos de fusion.yaml.",
            y,
            pred_hybrid,
            s_hybrid,
            rural,
        ),
    ]

    # Derivación a revisión humana (amarillo o rojo) de solicitantes legítimos:
    # es la causa de las demoras que describe el enunciado.
    legit = y == 0
    review = np.isin(semaforo, ["amarillo", "rojo"])
    flagged_checklist = checklist == 1
    review_rates = {
        "hybrid_rural": _r(float(review[legit & rural].mean())),
        "hybrid_urbana": _r(float(review[legit & ~rural].mean())),
        "checklist_rural": _r(float(flagged_checklist[legit & rural].mean())),
        "checklist_urbana": _r(float(flagged_checklist[legit & ~rural].mean())),
    }
    semaforo_dist = {
        color: {
            "rural": int(((semaforo == color) & rural).sum()),
            "urbana": int(((semaforo == color) & ~rural).sum()),
        }
        for color in ("verde", "amarillo", "rojo")
    }

    audit = run_audit().model_dump(mode="json")
    checklist_m, hybrid_m = configs[0], configs[-1]
    fp_reduction = None
    fp_check = checklist_m["false_positives_rural"] + checklist_m["false_positives_urbana"]
    fp_hyb = hybrid_m["false_positives_rural"] + hybrid_m["false_positives_urbana"]
    if fp_check:
        fp_reduction = _r(1 - fp_hyb / fp_check)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "backend/scripts/export_metrics.py sobre data/test.csv (datos sintéticos)",
        "model_version": active_model_version(),
        "fusion": {
            "version": config.version,
            "weights": {
                "rules": config.weight_rules,
                "bayesian": config.weight_bayesian,
                "ml": config.weight_ml,
            },
            "verde_max": config.verde_max,
            "amarillo_max": config.amarillo_max,
        },
        "test_split": {
            "n": n,
            "n_fraud": int(y.sum()),
            "n_rural": int(rural.sum()),
            "n_urbana": int((~rural).sum()),
        },
        "dataset": _dataset_summary(full),
        "bayes": {
            "prior_rural": bayesian.FRAUDE_POR_ZONA["rural"],
            "prior_urbana": bayesian.FRAUDE_POR_ZONA["urbana"],
            "likelihood_ratios": _likelihood_ratios(),
        },
        "rules": _rules_summary(),
        "ablation": configs,
        "headline": {
            "fp_reduction_vs_checklist": fp_reduction,
            "false_positives_checklist": fp_check,
            "false_positives_hybrid": fp_hyb,
        },
        "review_rates_legit": review_rates,
        "semaforo_distribution": semaforo_dist,
        "audit": {
            "global_metrics": audit["global_metrics"],
            "fpr_by_group": audit["fpr_by_group"],
            "parity": audit["parity"],
            "threshold_suggestion": audit["threshold_suggestion"],
        },
    }


def _pct(value: float | None, digits: int = 1) -> str:
    return "n/d" if value is None else f"{value * 100:.{digits}f} %"


def render_markdown(m: dict[str, Any]) -> str:
    """Reporte de auditoría ética legible (HU-23)."""
    lines = [
        "# Reporte de auditoría ética — CrediConfianza",
        "",
        f"Generado: {m['generated_at']} · Modelo: `{m['model_version']}` · "
        f"Fusión: `{m['fusion']['version']}`",
        "",
        f"Fuente: {m['source']}. Split de prueba: {m['test_split']['n']} solicitudes "
        f"({m['test_split']['n_fraud']} fraudes; {m['test_split']['n_rural']} rurales).",
        "",
        "## Comparación de configuraciones (ablación)",
        "",
        "| Configuración | AUC | Precisión | Recall | F1 | FPR rural | FPR urbana |",
        "|---|---|---|---|---|---|---|",
    ]
    for c in m["ablation"]:
        auc = "—" if c["auc"] is None else f"{c['auc']:.3f}"
        lines.append(
            f"| {c['name']} | {auc} | {c['precision']:.3f} | {c['recall']:.3f} | "
            f"{c['f1']:.3f} | {_pct(c['fpr_rural'], 2)} | {_pct(c['fpr_urbana'], 2)} |"
        )
    rr = m["review_rates_legit"]
    lines += [
        "",
        "## Solicitantes legítimos enviados a revisión",
        "",
        f"- Lista de chequeo simulada: rural {_pct(rr['checklist_rural'])}, "
        f"urbana {_pct(rr['checklist_urbana'])}.",
        f"- Sistema híbrido (amarillo o rojo): rural {_pct(rr['hybrid_rural'])}, "
        f"urbana {_pct(rr['hybrid_urbana'])}.",
        "",
        "## Tasa de falsos positivos por grupo (alerta roja, IC 95 % de Wilson)",
        "",
        "| Variable | Grupo | n | FP | FPR | IC 95 % |",
        "|---|---|---|---|---|---|",
    ]
    for g in m["audit"]["fpr_by_group"]:
        ci = f"{_pct(g['fpr_ci_low'], 2)} – {_pct(g['fpr_ci_high'], 2)}"
        lines.append(
            f"| {g['attribute']} | {g['group']} | {g['n_samples']} | "
            f"{g['n_false_positives']} | {_pct(g['fpr'], 2)} | {ci} |"
        )
    lines += [
        "",
        "## Paridad entre grupos (fairlearn)",
        "",
        "| Variable | Diferencia de paridad demográfica | Diferencia de Equalized Odds |",
        "|---|---|---|",
    ]
    for p in m["audit"]["parity"]:
        lines.append(
            f"| {p['attribute']} | {p['demographic_parity_difference']:.4f} | "
            f"{p['equalized_odds_difference']:.4f} |"
        )
    t = m["audit"]["threshold_suggestion"]
    lines += [
        "",
        "## Sugerencia de umbral",
        "",
        t["rationale"],
        "",
        "## Limitaciones",
        "",
        "- Los datos son sintéticos: las cifras validan el diseño, no el desempeño en producción.",
        "- El fraude del generador depende sobre todo de los indicios fuertes, por eso el AUC es "
        "casi perfecto; con datos reales se espera un desempeño menor.",
        "- Con pocos falsos positivos por grupo, los intervalos de confianza son amplios.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    """Calcula y escribe los tres archivos de salida."""
    metrics = compute()
    FAIRNESS_DIR.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(metrics, ensure_ascii=False, indent=2) + "\n"
    (FAIRNESS_DIR / "metricas_resultados.json").write_text(payload, encoding="utf-8")
    (FAIRNESS_DIR / "reporte_auditoria.md").write_text(render_markdown(metrics), encoding="utf-8")
    FRONTEND_SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
    FRONTEND_SNAPSHOT.write_text(payload, encoding="utf-8")
    print(f"Métricas exportadas ({metrics['test_split']['n']} solicitudes).")


if __name__ == "__main__":
    main()
