"""Red bayesiana para detección de fraude en microfinanzas (HU-12, HU-13).

Estructura del grafo (acíclico, validado por pgmpy):

    zona ─▶ fraude ─▶ {6 indicios fuertes}
      │        └──▶ {13 señales débiles} ◀── zona
      ├─▶ tipo_negocio ─▶ sin_local_fijo, negocio_pequeno_monto
      └─▶ es_estacional

Supuestos éticos y probabilísticos (artefactos auditables, ver AGENTS.md):

1. **La zona no es predictora directa de fraude con sesgo**: P(fraude|rural)
   = 0.0329 y P(fraude|urbana) = 0.0378 (estimado en `data/train.csv`,
   semilla 42, 2026-11-23) — tasas casi iguales por diseño del generador
   (HU-07 exige fraude similar entre zonas).
2. **Las señales débiles no implican fraude en lo rural**: sus CPDs son
   P(señal | fraude, zona) estimadas del dataset. En zona rural las tasas
   fraude/no-fraude son casi idénticas (p.ej. celular_prepago: 0.770 vs
   0.822), por lo que la razón de verosimilitud ≈ 1 y la señal **no**
   mueve la probabilidad de fraude. En urbana sí son algo más informativas.
3. **Los indicios fuertes son altamente informativos**: P(indicio|fraude)
   ≈ 0.41–0.47 vs P(indicio|no fraude) ≈ 0.004–0.005 (razón ≈ 90–100).
4. **Procedencia de cada valor**: todas las CPDs de señales e indicios están
   *estimadas del dataset de entrenamiento*; el prior de zona y la
   distribución de tipo de negocio también. Los valores se suavizan con un
   mínimo de 0.001 para que la inferencia nunca divida por cero con
   evidencia parcial (HU-13).
"""

from __future__ import annotations

import itertools
import math
from typing import Any

from pgmpy.factors.discrete import TabularCPD
from pgmpy.inference import VariableElimination
from pgmpy.models import DiscreteBayesianNetwork

from app.schemas.evaluation import EvaluationRequest

# ── Estados ──────────────────────────────────────────────────────────────────
BIN = ["no", "si"]  # 0 = no, 1 = si
ZONAS = ["rural", "urbana"]
TIPOS_NEGOCIO = ["local_fijo", "parcela_finca", "plaza_mercado_feria", "servicios_domicilio"]

WEAK_SIGNALS: list[str] = [
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
]

STRONG_INDICATORS: list[str] = [
    "cedula_alterada",
    "ingresos_inconsistentes",
    "factura_falsa",
    "referencias_falsas",
    "historial_adverso",
    "negocio_inconsistente",
]

# ── CPDs estimadas de data/train.csv (semilla 42, 2026-11-23) ───────────────
# Procedencia: estimación empírica del dataset (NO experto). Ver docstring.

# P(fraude | zona)
FRAUDE_POR_ZONA = {"rural": 0.0329, "urbana": 0.0378}

# P(zona)
ZONA_PRIOR = {"rural": 0.5031, "urbana": 0.4969}

# P(tipo_negocio | zona)
TIPO_NEGOCIO_POR_ZONA: dict[str, dict[str, float]] = {
    "rural": {
        "local_fijo": 0.1011,
        "parcela_finca": 0.5934,
        "plaza_mercado_feria": 0.2510,
        "servicios_domicilio": 0.0545,
    },
    "urbana": {
        "local_fijo": 0.5264,
        "parcela_finca": 0.0556,
        "plaza_mercado_feria": 0.1806,
        "servicios_domicilio": 0.2375,
    },
}

# P(es_estacional | zona)
ESTACIONAL_POR_ZONA = {"rural": 0.542, "urbana": 0.001}


# P(señal débil | fraude, zona) — orden [f=no/z=rural, f=no/z=urbana,
# f=si/z=rural, f=si/z=urbana] mapeado abajo a (f, z).
def _w(no_r: float, no_u: float, si_r: float, si_u: float) -> dict[tuple[int, str], float]:
    """Helper: tabla (fraude, zona) → P(señal | fraude, zona)."""
    return {(0, "rural"): no_r, (0, "urbana"): no_u, (1, "rural"): si_r, (1, "urbana"): si_u}


WEAK_CPDS: dict[str, dict[tuple[int, str], float]] = {
    "sin_historial": _w(0.575, 0.298, 0.690, 0.437),
    "vive_lejos": _w(0.800, 0.157, 0.805, 0.117),
    "sin_local_fijo": _w(0.662, 0.208, 0.695, 0.188),
    "sin_fiador": _w(0.524, 0.392, 0.529, 0.431),
    "cedula_otra_region": _w(0.282, 0.204, 0.287, 0.147),
    "celular_prepago": _w(0.822, 0.384, 0.770, 0.371),
    "sin_cuenta_bancaria": _w(0.701, 0.209, 0.644, 0.183),
    "factura_manual": _w(0.786, 0.249, 0.747, 0.249),
    "fotos_poco_convincentes": _w(0.453, 0.181, 0.534, 0.264),
    "sin_referencias_comerciales": _w(0.562, 0.245, 0.557, 0.234),
    "nombre_distinto_recibo": _w(0.480, 0.190, 0.506, 0.183),
    "negocio_pequeno_monto": _w(0.349, 0.220, 0.356, 0.340),
    "direccion_sin_georreferenciar": _w(0.832, 0.111, 0.833, 0.183),
}

# P(indicio fuerte | fraude) — [no fraude, fraude]
STRONG_CPDS: dict[str, tuple[float, float]] = {
    "cedula_alterada": (0.0042, 0.410),
    "ingresos_inconsistentes": (0.0048, 0.434),
    "factura_falsa": (0.0046, 0.466),
    "referencias_falsas": (0.0053, 0.469),
    "historial_adverso": (0.0043, 0.439),
    "negocio_inconsistente": (0.0047, 0.456),
}

# CPDs de señales con padre adicional tipo_negocio (16 combinaciones c/u):
# orden de columnas: (f, zona, tipo) con tipo variando más rápido.
SIGNALS_WITH_TIPO = ("sin_local_fijo", "negocio_pequeno_monto")

# P(sin_local_fijo | f, zona, tipo)
SIN_LOCAL_FIJO_CPDS: dict[tuple[int, str, str], float] = {
    (0, "rural", "local_fijo"): 0.3451,
    (0, "rural", "parcela_finca"): 0.7274,
    (0, "rural", "plaza_mercado_feria"): 0.7083,
    (0, "rural", "servicios_domicilio"): 0.3286,
    (0, "urbana", "local_fijo"): 0.2071,
    (0, "urbana", "parcela_finca"): 0.1993,
    (0, "urbana", "plaza_mercado_feria"): 0.2071,
    (0, "urbana", "servicios_domicilio"): 0.2108,
    (1, "rural", "local_fijo"): 0.2917,
    (1, "rural", "parcela_finca"): 0.7525,
    (1, "rural", "plaza_mercado_feria"): 0.7955,
    (1, "rural", "servicios_domicilio"): 0.6000,
    (1, "urbana", "local_fijo"): 0.1727,
    (1, "urbana", "parcela_finca"): 0.1111,
    (1, "urbana", "plaza_mercado_feria"): 0.1538,
    (1, "urbana", "servicios_domicilio"): 0.2821,
}

# P(negocio_pequeno_monto | f, zona, tipo)
NEGOCIO_PEQUENO_CPDS: dict[tuple[int, str, str], float] = {
    (0, "rural", "local_fijo"): 0.3235,
    (0, "rural", "parcela_finca"): 0.3573,
    (0, "rural", "plaza_mercado_feria"): 0.3323,
    (0, "rural", "servicios_domicilio"): 0.3746,
    (0, "urbana", "local_fijo"): 0.2159,
    (0, "urbana", "parcela_finca"): 0.1779,
    (0, "urbana", "plaza_mercado_feria"): 0.2359,
    (0, "urbana", "servicios_domicilio"): 0.2250,
    (1, "rural", "local_fijo"): 0.2500,
    (1, "rural", "parcela_finca"): 0.4059,
    (1, "rural", "plaza_mercado_feria"): 0.3182,
    (1, "rural", "servicios_domicilio"): 0.2000,
    (1, "urbana", "local_fijo"): 0.3273,
    (1, "urbana", "parcela_finca"): 0.4444,
    (1, "urbana", "plaza_mercado_feria"): 0.4103,
    (1, "urbana", "servicios_domicilio"): 0.2821,
}

# Suavizado: probabilidad mínima para evitar ceros (evidencia parcial HU-13)
EPS = 0.001


def _smooth(p: float) -> float:
    """Recorta p al rango [EPS, 1-EPS] para inferencia estable."""
    return max(EPS, min(1.0 - EPS, p))


def _binary_cpd(
    name: str,
    parents: list[str],
    prob_si: dict[tuple[Any, ...], float],
) -> TabularCPD:
    """Construye una CPD binaria (no/si) para `name` con los padres dados.

    `prob_si` mapea cada combinación de estados de padres (en el orden de
    `parents`) a P(name=si | padres). Sin padres se interpreta como prior.
    """
    if not parents:
        p = _smooth(prob_si[()])
        return TabularCPD(variable=name, variable_card=2, values=[[1 - p, p]])

    evidence_cards = [len(_states_of(p_)) for p_ in parents]
    total = 1
    for card in evidence_cards:
        total *= card

    # Columnas en orden row-major: primer padre varía más lento (convención pgmpy)
    values_no: list[float] = []
    values_si: list[float] = []
    parent_states = [list(_states_of(p_)) for p_ in parents]
    for combo in itertools.product(*parent_states):
        p_si = _smooth(prob_si[tuple(combo)])
        values_no.append(1.0 - p_si)
        values_si.append(p_si)

    return TabularCPD(
        variable=name,
        variable_card=2,
        values=[values_no, values_si],
        evidence=parents,
        evidence_card=evidence_cards,
    )


def _states_of(node: str) -> list[str]:
    """Estados discretos de un nodo del grafo."""
    if node == "zona":
        return ZONAS
    if node == "tipo_negocio":
        return TIPOS_NEGOCIO
    return BIN


class BayesianEngine:
    """Red bayesiana con inferencia P(fraude | evidencia) < 1 s (HU-13)."""

    def __init__(self) -> None:
        """Construye el grafo y las CPDs una sola vez (singleton por proceso)."""
        self.model = self._build_model()
        self.infer = VariableElimination(self.model)

    @staticmethod
    def _build_model() -> DiscreteBayesianNetwork:
        """Construye la red discreta con todas las CPDs documentadas."""
        edges: list[tuple[str, str]] = [("zona", "fraude"), ("zona", "tipo_negocio")]
        edges += [("fraude", s) for s in STRONG_INDICATORS]
        edges += [("fraude", w) for w in WEAK_SIGNALS]
        edges += [("zona", w) for w in WEAK_SIGNALS]
        edges += [("zona", "es_estacional")]
        # Señales con padre adicional tipo_negocio
        for w in SIGNALS_WITH_TIPO:
            edges.append(("tipo_negocio", w))

        model = DiscreteBayesianNetwork(edges)

        cpds: list[TabularCPD] = []

        # P(zona)
        cpds.append(
            TabularCPD(
                variable="zona",
                variable_card=2,
                values=[[ZONA_PRIOR["rural"]], [ZONA_PRIOR["urbana"]]],
                state_names={"zona": ZONAS},
            )
        )

        # P(fraude | zona)
        cpds.append(
            TabularCPD(
                variable="fraude",
                variable_card=2,
                values=[
                    [1 - FRAUDE_POR_ZONA["rural"], 1 - FRAUDE_POR_ZONA["urbana"]],
                    [FRAUDE_POR_ZONA["rural"], FRAUDE_POR_ZONA["urbana"]],
                ],
                evidence=["zona"],
                evidence_card=[2],
                state_names={"fraude": BIN, "zona": ZONAS},
            )
        )

        # P(tipo_negocio | zona): fila por estado de tipo, columna por zona
        tipo_rows = [
            [
                _smooth(TIPO_NEGOCIO_POR_ZONA["rural"][t]),
                _smooth(TIPO_NEGOCIO_POR_ZONA["urbana"][t]),
            ]
            for t in TIPOS_NEGOCIO
        ]
        cpds.append(
            TabularCPD(
                variable="tipo_negocio",
                variable_card=len(TIPOS_NEGOCIO),
                values=tipo_rows,
                evidence=["zona"],
                evidence_card=[2],
                state_names={"tipo_negocio": TIPOS_NEGOCIO, "zona": ZONAS},
            )
        )

        # P(es_estacional | zona)
        cpds.append(
            TabularCPD(
                variable="es_estacional",
                variable_card=2,
                values=[
                    [
                        1 - _smooth(ESTACIONAL_POR_ZONA["rural"]),
                        1 - _smooth(ESTACIONAL_POR_ZONA["urbana"]),
                    ],
                    [
                        _smooth(ESTACIONAL_POR_ZONA["rural"]),
                        _smooth(ESTACIONAL_POR_ZONA["urbana"]),
                    ],
                ],
                evidence=["zona"],
                evidence_card=[2],
                state_names={"es_estacional": BIN, "zona": ZONAS},
            )
        )

        # Indicios fuertes: P(indicio | fraude)
        for name, (p_no, p_si) in STRONG_CPDS.items():
            cpds.append(
                TabularCPD(
                    variable=name,
                    variable_card=2,
                    values=[[1 - _smooth(p_no), 1 - _smooth(p_si)], [_smooth(p_no), _smooth(p_si)]],
                    evidence=["fraude"],
                    evidence_card=[2],
                    state_names={name: BIN, "fraude": BIN},
                )
            )

        # Señales débiles con padres (fraude, zona)
        for name, table in WEAK_CPDS.items():
            if name in SIGNALS_WITH_TIPO:
                continue  # se construyen abajo con 3 padres
            # columnas row-major: fraude (lento) × zona (rápido)
            probs = [
                _smooth(table[(0, "rural")]),
                _smooth(table[(0, "urbana")]),
                _smooth(table[(1, "rural")]),
                _smooth(table[(1, "urbana")]),
            ]
            cpds.append(
                TabularCPD(
                    variable=name,
                    variable_card=2,
                    values=[[1 - p for p in probs], probs],
                    evidence=["fraude", "zona"],
                    evidence_card=[2, 2],
                    state_names={name: BIN, "fraude": BIN, "zona": ZONAS},
                )
            )

        # Señales débiles con padres (fraude, zona, tipo_negocio)
        tipo_tables = {
            "sin_local_fijo": SIN_LOCAL_FIJO_CPDS,
            "negocio_pequeno_monto": NEGOCIO_PEQUENO_CPDS,
        }
        for name, table in tipo_tables.items():
            probs: list[float] = []
            for f in (0, 1):
                for z in ZONAS:
                    for t in TIPOS_NEGOCIO:
                        probs.append(_smooth(table[(f, z, t)]))
            cpds.append(
                TabularCPD(
                    variable=name,
                    variable_card=2,
                    values=[[1 - p for p in probs], probs],
                    evidence=["fraude", "zona", "tipo_negocio"],
                    evidence_card=[2, 2, len(TIPOS_NEGOCIO)],
                    state_names={
                        name: BIN,
                        "fraude": BIN,
                        "zona": ZONAS,
                        "tipo_negocio": TIPOS_NEGOCIO,
                    },
                )
            )

        model.add_cpds(*cpds)
        model.check_model()
        return model

    def probability(self, request: EvaluationRequest) -> float:
        """Devuelve P(fraude | evidencia) ∈ [0, 1] (HU-13).

        La evidencia se limita a los nodos observables de la solicitud; los
        campos faltantes simplemente no se observan (inferencia con evidencia
        parcial, sin fallar).
        """
        evidence: dict[str, Any] = {
            "zona": request.tipo_zona.value,
            "tipo_negocio": request.tipo_negocio.value,
            "es_estacional": "si" if request.es_estacional else "no",
        }
        for signal in WEAK_SIGNALS:
            evidence[signal] = "si" if getattr(request, signal) else "no"
        for indicator in STRONG_INDICATORS:
            evidence[indicator] = "si" if getattr(request, indicator) else "no"

        result = self.infer.query(variables=["fraude"], evidence=evidence)
        # Estados del nodo fraude: ["no", "si"]
        values = result.values
        return float(values[1])

    def explain(self, request: EvaluationRequest, posterior: float | None = None) -> dict[str, Any]:
        """Descompone P(fraude | evidencia) en prior × razones de verosimilitud.

        Con la zona observada, cada señal e indicio depende solo de
        (fraude, zona[, tipo_negocio]) y es condicionalmente independiente
        de los demás, así que la inferencia exacta equivale a:

            odds_post = odds(P(fraude | zona)) × Π_i LR_i
            LR_i = P(e_i | fraude=si, padres) / P(e_i | fraude=no, padres)

        `tipo_negocio` y `es_estacional` no son descendientes de `fraude`:
        no aportan LR propio (solo seleccionan la columna de la CPD).
        La posterior se toma de la inferencia pgmpy (fuente de verdad); el
        desglose usa las mismas CPDs suavizadas, por lo que coincide.
        """
        zona = request.tipo_zona.value
        tipo = request.tipo_negocio.value
        prior = FRAUDE_POR_ZONA[zona]

        def _lr(p_si: float, p_no: float, observed: bool) -> float:
            if observed:
                return p_si / p_no
            return (1 - p_si) / (1 - p_no)

        evidence: list[dict[str, Any]] = []
        for signal in WEAK_SIGNALS:
            observed = bool(getattr(request, signal))
            if signal == "sin_local_fijo":
                p_no = _smooth(SIN_LOCAL_FIJO_CPDS[(0, zona, tipo)])
                p_si = _smooth(SIN_LOCAL_FIJO_CPDS[(1, zona, tipo)])
            elif signal == "negocio_pequeno_monto":
                p_no = _smooth(NEGOCIO_PEQUENO_CPDS[(0, zona, tipo)])
                p_si = _smooth(NEGOCIO_PEQUENO_CPDS[(1, zona, tipo)])
            else:
                p_no = _smooth(WEAK_CPDS[signal][(0, zona)])
                p_si = _smooth(WEAK_CPDS[signal][(1, zona)])
            evidence.append(
                {
                    "variable": signal,
                    "observed": observed,
                    "kind": "debil",
                    "likelihood_ratio": _lr(p_si, p_no, observed),
                }
            )
        for indicator in STRONG_INDICATORS:
            observed = bool(getattr(request, indicator))
            p_no_raw, p_si_raw = STRONG_CPDS[indicator]
            evidence.append(
                {
                    "variable": indicator,
                    "observed": observed,
                    "kind": "fuerte",
                    "likelihood_ratio": _lr(_smooth(p_si_raw), _smooth(p_no_raw), observed),
                }
            )

        evidence.sort(key=lambda e: abs(math.log(e["likelihood_ratio"])), reverse=True)
        return {
            "prior": prior,
            "posterior": posterior if posterior is not None else self.probability(request),
            "evidence": evidence,
        }


_engine: BayesianEngine | None = None


def get_bayesian_engine() -> BayesianEngine:
    """Devuelve (creando si hace falta) la instancia singleton de la red."""
    global _engine
    if _engine is None:
        _engine = BayesianEngine()
    return _engine


def predict_bayesian_probability(request: EvaluationRequest) -> float:
    """API funcional: P(fraude | evidencia) con la instancia singleton."""
    return get_bayesian_engine().probability(request)
