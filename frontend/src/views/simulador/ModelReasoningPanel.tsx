/**
 * Panel «Razonamiento de los modelos» (HU-20).
 *
 * Muestra, motor por motor, cómo se llegó al veredicto:
 *   - Reglas expertas: reglas activadas, aporte fuerte/débil y tope rural.
 *   - Red bayesiana: probabilidad base P(fraude | zona) → razones de
 *     verosimilitud de la evidencia → probabilidad posterior.
 *   - Modelo ML: contribuciones SHAP que suben o bajan el riesgo.
 *   - Fusión: aporte en puntos de cada motor frente a los umbrales.
 *
 * Todos los números vienen de `EvaluationResponse.reasoning` (backend); si el
 * backend no lo envía, se muestran solo las salidas agregadas de cada motor.
 */

import { useState } from "react";
import type {
  BayesianEvidence,
  EvaluationResponse,
  KnowledgeResponse,
} from "../../api/types/evaluation.types";
import { MaterialIcon } from "../../components/MaterialIcon";
import { signalLabel } from "../../data/signals";

type Fusion = KnowledgeResponse["fusion"];

interface Props {
  result: EvaluationResponse;
  fusion?: Fusion;
}

const pct = (p: number, digits = 1): string => `${(p * 100).toFixed(digits)}%`;

/** Fórmula de fusión con los pesos vigentes del backend. */
function fusionFormula(fusion: Fusion | undefined): string {
  if (!fusion) return "S = w₁·S_reglas + w₂·P_bayes + w₃·P_ml";
  const w = fusion.weights;
  return `S = ${w.rules.toFixed(2)}·S_reglas + ${w.bayesian.toFixed(2)}·P_bayes + ${w.ml.toFixed(2)}·P_ml`;
}

// ── Piezas comunes ───────────────────────────────────────────────────────────

interface EngineSectionProps {
  icon: string;
  accent: string; // clase de borde izquierdo
  iconClass: string;
  title: string;
  subtitle: string;
  weight?: number;
  value: string;
  valueCaption: string;
  missing?: boolean;
  children: React.ReactNode;
}

function EngineSection({
  icon,
  accent,
  iconClass,
  title,
  subtitle,
  weight,
  value,
  valueCaption,
  missing,
  children,
}: EngineSectionProps) {
  return (
    <section
      aria-label={title}
      className={`rounded-xl border border-slate-200 bg-white border-l-[3px] ${accent}`}
    >
      <header className="flex items-start gap-3 px-4 pt-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <MaterialIcon name={icon} className={`text-[18px] ${iconClass}`} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
            {title}
            {weight !== undefined ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                peso {Math.round(weight * 100)}%
              </span>
            ) : null}
          </h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold leading-none text-slate-900 tabular-nums">
            {missing ? "—" : value}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{valueCaption}</div>
        </div>
      </header>
      <div className="px-4 pb-4 pt-3">
        {missing ? (
          <p className="rounded-lg border border-dashed border-orange-300 bg-orange-50 px-3 py-2 text-xs text-orange-800">
            Este motor no estuvo disponible; la fusión se renormalizó con los demás.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

// ── Reglas ──────────────────────────────────────────────────────────────────

const RULES_PREVIEW = 4;

function RulesReasoningView({ result }: { result: EvaluationResponse }) {
  const [showAll, setShowAll] = useState(false);
  const rules = [...(result.activated_rules ?? [])].sort(
    (a, b) => Math.abs(b.peso) - Math.abs(a.peso),
  );
  const visible = showAll ? rules : rules.slice(0, RULES_PREVIEW);
  const detail = result.reasoning?.rules;
  return (
    <div className="flex flex-col gap-2">
      {rules.length === 0 ? (
        <p className="text-xs text-slate-500">No se activó ninguna regla con esta evidencia.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((r) => (
            <li
              key={r.id_regla}
              className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs"
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                  r.peso < 0
                    ? "bg-emerald-100 text-emerald-900"
                    : r.peso === 0
                      ? "bg-sky-100 text-sky-900"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {r.id_regla}
              </span>
              <span className="flex-1 leading-snug text-slate-700">{r.justificacion}</span>
              <span className="shrink-0 font-semibold tabular-nums text-slate-800">
                {r.peso === 0 ? "auditoría" : `${r.peso > 0 ? "+" : ""}${r.peso.toFixed(2)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      {rules.length > RULES_PREVIEW ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="self-start text-xs font-semibold text-primary hover:underline"
        >
          {showAll ? "Mostrar solo las principales" : `Ver las ${rules.length} reglas activadas`}
        </button>
      ) : null}
      {detail ? (
        <p className="text-xs leading-relaxed text-slate-600">
          Indicios fuertes y salvaguardas suman{" "}
          <strong className="tabular-nums">{detail.strong_score.toFixed(2)}</strong>; señales
          débiles <strong className="tabular-nums">{detail.weak_score_raw.toFixed(2)}</strong>
          {detail.rural_cap_applied ? (
            <>
              , <strong>topadas a {detail.rural_cap.toFixed(2)}</strong> por la salvaguarda rural
              (R-SAFE-01)
            </>
          ) : null}
          . Subpuntaje final (recortado a 0–1):{" "}
          <strong className="tabular-nums">{detail.subscore.toFixed(2)}</strong>.
        </p>
      ) : null}
    </div>
  );
}

// ── Red bayesiana ───────────────────────────────────────────────────────────

/** Clasifica una razón de verosimilitud en sube / baja / neutra. */
function lrTone(lr: number): { cls: string; label: string } {
  if (lr >= 1.25) return { cls: "bg-rose-50 text-rose-800 border-rose-200", label: "sube" };
  if (lr <= 0.8) return { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "baja" };
  return { cls: "bg-slate-50 text-slate-600 border-slate-200", label: "≈ neutra" };
}

function formatLr(lr: number): string {
  if (lr >= 10) return `×${lr.toFixed(0)}`;
  return `×${lr.toFixed(2)}`;
}

function EvidenceChip({ e, label }: { e: BayesianEvidence; label?: string }) {
  const tone = lrTone(e.likelihood_ratio);
  return (
    <li
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${tone.cls}`}
      title={`Razón de verosimilitud: ${e.likelihood_ratio.toFixed(3)} (${tone.label})`}
    >
      <span className="text-[11px]">{label ?? signalLabel(e.variable)}</span>
      <span className="text-[11px] font-semibold tabular-nums">{formatLr(e.likelihood_ratio)}</span>
    </li>
  );
}

function BayesianReasoningView({ result }: { result: EvaluationResponse }) {
  const [showAll, setShowAll] = useState(false);
  const b = result.reasoning?.bayesian;
  if (!b) {
    return (
      <p className="text-xs text-slate-600">
        P(fraude | evidencia) = <strong>{pct(result.bayesian_probability, 2)}</strong>. El backend
        no envió el desglose por evidencia.
      </p>
    );
  }
  const evidence = b.evidence ?? [];
  const observed = evidence.filter((e) => e.observed);
  const absent = evidence.filter((e) => !e.observed);
  const absentProduct = absent.reduce((acc, e) => acc * e.likelihood_ratio, 1);
  const absentStrong = absent.filter((e) => e.kind === "fuerte").length;
  const absentSummary: BayesianEvidence = {
    variable: "ausencias",
    observed: false,
    kind: "fuerte",
    likelihood_ratio: absentProduct,
  };

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-xs">
        <li className="flex items-center justify-between gap-3">
          <span className="text-slate-600">
            <span className="mr-1.5 font-semibold text-slate-400">1</span>
            Probabilidad base P(fraude | zona)
          </span>
          <span className="font-semibold tabular-nums text-slate-900">{pct(b.prior, 2)}</span>
        </li>
        <li className="flex flex-col gap-1.5 border-y border-slate-200/80 py-2">
          <span className="text-slate-600">
            <span className="mr-1.5 font-semibold text-slate-400">2</span>
            Evidencia × razón de verosimilitud
          </span>
          <ul className="flex flex-wrap gap-1.5 pl-4" aria-label="Evidencia observada">
            {observed.map((e) => (
              <EvidenceChip key={e.variable} e={e} />
            ))}
            {absent.length > 0 ? (
              <EvidenceChip
                e={absentSummary}
                label={`${absent.length} señales ausentes (${absentStrong} fuertes)`}
              />
            ) : null}
          </ul>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="text-slate-600">
            <span className="mr-1.5 font-semibold text-slate-400">3</span>
            Probabilidad posterior
          </span>
          <span className="font-semibold tabular-nums text-sky-800">{pct(b.posterior, 2)}</span>
        </li>
      </ol>
      <p className="text-xs leading-relaxed text-slate-600">
        Cada evidencia multiplica las probabilidades a favor del fraude por su razón de
        verosimilitud. Una razón cercana a ×1 no mueve el resultado: así ocurre con la informalidad
        rural, que es igual de frecuente con y sin fraude. La ausencia de indicios fuertes reduce el
        riesgo.
      </p>
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="self-start text-xs font-semibold text-primary hover:underline"
      >
        {showAll ? "Ocultar detalle por nodo" : `Ver los ${evidence.length} nodos evaluados`}
      </button>
      {showAll ? (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
              <th className="py-1 font-medium">Nodo</th>
              <th className="py-1 font-medium">Tipo</th>
              <th className="py-1 font-medium">Observado</th>
              <th className="py-1 text-right font-medium">Razón</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((e) => (
              <tr key={e.variable} className="border-b border-slate-100">
                <td className="py-1 text-slate-800">{signalLabel(e.variable)}</td>
                <td className="py-1 text-slate-500">{e.kind}</td>
                <td className="py-1 text-slate-500">{e.observed ? "sí" : "no"}</td>
                <td className="py-1 text-right font-mono tabular-nums">
                  {e.likelihood_ratio.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

// ── Modelo ML (SHAP) ────────────────────────────────────────────────────────

function MlReasoningView({ result }: { result: EvaluationResponse }) {
  const ml = result.reasoning?.ml;
  const contributions = ml?.contributions ?? [];
  if (contributions.length === 0) {
    return (
      <p className="text-xs text-slate-600">
        Probabilidad del modelo: <strong>{pct(result.ml_probability, 2)}</strong>. No hay
        contribuciones SHAP disponibles para esta evaluación.
      </p>
    );
  }
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.shap_value)), 1e-6);
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_3.5rem] items-center gap-3 text-[11px]">
        <span />
        <span className="flex justify-between">
          <span className="text-emerald-700">← reduce el riesgo</span>
          <span className="text-rose-700">aumenta el riesgo →</span>
        </span>
        <span />
      </div>
      <ul className="flex flex-col gap-1.5" aria-label="Contribuciones SHAP">
        {contributions.map((c) => {
          const width = `${(Math.abs(c.shap_value) / maxAbs) * 50}%`;
          const up = c.shap_value > 0;
          return (
            <li
              key={c.feature}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_3.5rem] items-center gap-3"
            >
              <span className="flex items-center justify-end gap-1.5 text-right text-xs text-slate-700">
                {c.is_rural_context ? (
                  <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-800">
                    rural
                  </span>
                ) : null}
                <span className="truncate" title={c.title}>
                  {c.title}
                </span>
              </span>
              <span className="relative h-5" aria-label={`SHAP ${c.shap_value.toFixed(3)}`}>
                <span className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                <span
                  className={`absolute inset-y-0.5 rounded ${up ? "left-1/2 bg-rose-400" : "right-1/2 bg-emerald-400"}`}
                  style={{ width }}
                />
              </span>
              <span
                className={`text-right text-[11px] font-semibold tabular-nums ${up ? "text-rose-700" : "text-emerald-700"}`}
              >
                {up ? "+" : ""}
                {c.shap_value.toFixed(3)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-relaxed text-slate-600">
        Valores SHAP en escala log-odds del XGBoost: muestran qué variables empujaron la predicción
        de esta solicitud. Las marcadas «rural» son contexto típico de la economía campesina y no
        implican fraude.
      </p>
    </div>
  );
}

// ── Fusión ──────────────────────────────────────────────────────────────────

const ENGINE_META: Record<string, { label: string; bar: string; dot: string }> = {
  rules: { label: "Reglas", bar: "bg-emerald-700", dot: "bg-emerald-700" },
  bayesian: { label: "Bayes", bar: "bg-trust-blue", dot: "bg-trust-blue" },
  ml: { label: "ML", bar: "bg-indigo-500", dot: "bg-indigo-500" },
};

function FusionView({ result, fusion }: Props) {
  const f = result.reasoning?.fusion;
  const verdeMax = f?.verde_max ?? fusion?.verde_max ?? 20;
  const amarilloMax = f?.amarillo_max ?? fusion?.amarillo_max ?? 65;
  return (
    <section
      aria-label="Fusión ponderada"
      className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MaterialIcon name="merge" className="text-[18px] text-coop-forest" />
          Fusión ponderada
        </h3>
        {fusion ? (
          <span className="text-[11px] text-slate-500">fusion.yaml v{fusion.version}</span>
        ) : null}
      </div>
      <div className="font-mono text-xs text-slate-800">{fusionFormula(fusion)}</div>
      {f ? (
        <>
          <div className="relative pt-1 pb-6">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
              {f.parts.map((p) => (
                <span
                  key={p.engine}
                  className={ENGINE_META[p.engine]?.bar ?? "bg-slate-400"}
                  style={{ width: `${Math.max(0, p.points)}%` }}
                  title={`${ENGINE_META[p.engine]?.label ?? p.engine}: ${p.points.toFixed(1)} pts`}
                />
              ))}
            </div>
            {[verdeMax, amarilloMax].map((t) => (
              <span
                key={t}
                className="absolute top-0 flex flex-col items-center text-[10px] text-slate-500"
                style={{ left: `${t}%`, transform: "translateX(-50%)" }}
              >
                <span className="h-5 w-px bg-slate-400" />
                {t}
              </span>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
            {f.parts.map((p) => (
              <li key={p.engine} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${ENGINE_META[p.engine]?.dot ?? ""}`} />
                {ENGINE_META[p.engine]?.label ?? p.engine}: {p.weight.toFixed(2)} ×{" "}
                {p.value.toFixed(3)} ={" "}
                <strong className="tabular-nums">{p.points.toFixed(1)} pts</strong>
              </li>
            ))}
            <li className="font-semibold">= {result.risk_score} / 100</li>
          </ul>
          {f.floor_applied ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Por puntaje el caso sería <strong>{f.semaforo_by_score}</strong>, pero{" "}
              {f.strong_count} indicio(s) fuerte(s) elevan el semáforo a{" "}
              <strong>{result.semaforo}</strong> (piso de seguridad).
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

// ── Panel principal ─────────────────────────────────────────────────────────

export default function ModelReasoningPanel({ result, fusion }: Props) {
  const status = result.engine_status;
  const weights = fusion?.weights;
  return (
    <div className="flex flex-col gap-3">
      <EngineSection
        icon="fact_check"
        accent="border-l-emerald-700"
        iconClass="text-emerald-700"
        title="Motor de reglas expertas"
        subtitle="Indicadores directos y salvaguardas de equidad (knowledge/reglas.yaml)"
        weight={weights?.rules}
        value={result.rules_subscore.toFixed(2)}
        valueCaption="subpuntaje / 1.00"
        missing={status?.rules === "missing"}
      >
        <RulesReasoningView result={result} />
      </EngineSection>

      <EngineSection
        icon="hub"
        accent="border-l-trust-blue"
        iconClass="text-trust-blue"
        title="Red bayesiana"
        subtitle="Actualiza la probabilidad base con evidencia imperfecta (pgmpy)"
        weight={weights?.bayesian}
        value={pct(result.bayesian_probability, 2)}
        valueCaption="P(fraude | evidencia)"
        missing={status?.bayesian === "missing"}
      >
        <BayesianReasoningView result={result} />
      </EngineSection>

      <EngineSection
        icon="psychology"
        accent="border-l-indigo-500"
        iconClass="text-indigo-600"
        title="Modelo ML (XGBoost + SHAP)"
        subtitle="Clasificador supervisado calibrado; explicación local SHAP"
        weight={weights?.ml}
        value={pct(result.ml_probability, 2)}
        valueCaption="probabilidad"
        missing={status?.ml === "missing"}
      >
        <MlReasoningView result={result} />
      </EngineSection>

      <FusionView result={result} fusion={fusion} />
    </div>
  );
}
