/**
 * Panel del árbol de decisión del motor híbrido (HU-18, HU-20).
 *
 * Muestra el recorrido completo que tomó el modelo para llegar al veredicto:
 *   Señales activas → Reglas + Bayesiana + ML → Fusión ponderada → Semáforo.
 *
 * Los pesos y umbrales se leen de `GET /api/v1/knowledge` (fusion.yaml), de
 * modo que el árbol muestra exactamente la configuración que ejecutó el
 * backend. El `rules_subscore` y las probabilidades vienen de la evaluación.
 */

import type { EvaluationResponse, KnowledgeResponse } from "../../api/types/evaluation.types";
import { useKnowledge } from "../../hooks/useKnowledge";
import type { FormState } from "./types";

// ── Etiquetas cortas de las señales (mismo orden que FormState.weak/strong) ──

const WEAK_LABELS: string[] = [
  "Sin historial",
  "Vive lejos",
  "Sin local fijo",
  "Sin fiador",
  "Cédula otra región",
  "Cel. prepago",
  "Sin cuenta",
  "Factura manual",
  "Fotos rústicas",
  "Sin referencias",
  "Nombre distinto",
  "Negocio pequeño",
  "Sin georreferencia",
];

const STRONG_LABELS: string[] = [
  "Cédula alterada",
  "Ingresos inconsis.",
  "Factura falsa",
  "Referencias falsas",
  "Historial adverso",
  "Negocio inconsis.",
];

// ── Colores por semáforo ──────────────────────────────────────────────────────
const SEM_COLORS = {
  verde: {
    ring: "ring-emerald-300",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    label: "VERDE",
  },
  amarillo: {
    ring: "ring-amber-300",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    dot: "bg-amber-500",
    label: "AMARILLO",
  },
  rojo: {
    ring: "ring-rose-300",
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-800",
    dot: "bg-rose-600",
    label: "ROJO",
  },
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  form: FormState;
  result: EvaluationResponse;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

/** Flecha simple hacia abajo centrada. */
function DownArrow() {
  return (
    <div className="flex justify-center my-0.5">
      <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true">
        <line x1="7" y1="0" x2="7" y2="16" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="3,14 7,21 11,14" fill="#94a3b8" />
      </svg>
    </div>
  );
}

/** Tres flechas divergentes desde el centro hacia los tres motores. */
function ForkArrows() {
  return (
    <div className="relative h-8 w-full my-0.5" aria-hidden="true">
      <svg className="w-full h-full" viewBox="0 0 300 32" preserveAspectRatio="none">
        {/* Tronco central */}
        <line x1="150" y1="0" x2="150" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Ramas a los tres motores */}
        <line x1="150" y1="8" x2="50" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="150" y1="8" x2="150" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="150" y1="8" x2="250" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Puntas de flecha */}
        <polygon points="46,25 50,31 54,25" fill="#94a3b8" />
        <polygon points="146,25 150,31 154,25" fill="#94a3b8" />
        <polygon points="246,25 250,31 254,25" fill="#94a3b8" />
      </svg>
    </div>
  );
}

/** Tres flechas convergentes desde los tres motores hacia el centro. */
function MergeArrows() {
  return (
    <div className="relative h-8 w-full my-0.5" aria-hidden="true">
      <svg className="w-full h-full" viewBox="0 0 300 32" preserveAspectRatio="none">
        <line x1="50" y1="0" x2="150" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="150" y1="0" x2="150" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="250" y1="0" x2="150" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="146,22 150,28 154,22" fill="#94a3b8" />
      </svg>
    </div>
  );
}

/** Tarjeta de un motor individual (reglas, bayesiana o ML). */
interface EngineCardProps {
  icon: string;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  name: string;
  subtitle: string;
  status: "ok" | "missing";
  weightPct: number;
  metricLabel: string;
  metricValue: string;
  contribution: number;
}

function EngineCard({
  icon,
  iconColor,
  borderColor,
  bgColor,
  headerBg,
  name,
  subtitle,
  status,
  weightPct,
  metricLabel,
  metricValue,
  contribution,
}: EngineCardProps) {
  if (status === "missing") {
    return (
      <div className="border border-dashed border-slate-300 rounded-lg p-2.5 bg-slate-50/60 flex flex-col items-center justify-center gap-1.5 text-center min-h-[110px]">
        <span className={`material-symbols-outlined text-[22px] text-slate-300`}>{icon}</span>
        <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-wide">
          {name}
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
          motor no disponible
        </span>
      </div>
    );
  }

  return (
    <div className={`border ${borderColor} rounded-lg overflow-hidden flex flex-col`}>
      {/* Cabecera del motor */}
      <div className={`${headerBg} px-2.5 py-2 flex items-center gap-1.5 border-b ${borderColor}`}>
        <span className={`material-symbols-outlined text-[15px] ${iconColor}`}>{icon}</span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-slate-900 leading-none truncate">{name}</div>
          <div className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">{subtitle}</div>
        </div>
        <span className="ml-auto text-[9px] font-mono font-semibold text-slate-500 shrink-0">
          ×{weightPct}%
        </span>
      </div>

      {/* Métrica principal */}
      <div className={`${bgColor} flex-1 flex flex-col justify-center px-2.5 py-2 gap-1`}>
        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wide leading-none">
          {metricLabel}
        </div>
        <div className="text-base font-bold text-slate-900 font-mono leading-tight">
          {metricValue}
        </div>
      </div>

      {/* Aporte calculado */}
      <div className={`px-2.5 py-1.5 border-t ${borderColor} bg-white/80`}>
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-mono text-slate-500">aporte al score</span>
          <span className="text-[11px] font-bold text-slate-800 font-mono">
            {contribution.toFixed(2)} pts
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DecisionTreePanel({ form, result }: Props) {
  const knowledge = useKnowledge();
  if (!knowledge.data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-sm text-slate-500">
        {knowledge.status === "error"
          ? "No se pudo cargar la configuración de fusión para dibujar el recorrido."
          : "Cargando la configuración de fusión…"}
      </div>
    );
  }
  return <DecisionTree form={form} result={result} fusion={knowledge.data.fusion} />;
}

function DecisionTree({ form, result, fusion }: Props & { fusion: KnowledgeResponse["fusion"] }) {
  const W_RULES = fusion.weights.rules;
  const W_BAYES = fusion.weights.bayesian;
  const W_ML = fusion.weights.ml;
  const VERDE_MAX = fusion.verde_max;
  const AMARILLO_MAX = fusion.amarillo_max;
  // Señales activas
  const activeWeak = form.weak
    .map((v, i) => (v ? WEAK_LABELS[i] : null))
    .filter((v): v is string => v !== null);
  const activeStrong = form.strong
    .map((v, i) => (v ? STRONG_LABELS[i] : null))
    .filter((v): v is string => v !== null);

  // Estado de cada motor
  const rulesOk = result.engine_status?.rules === "ok";
  const bayesOk = result.engine_status?.bayesian === "ok";
  const mlOk = result.engine_status?.ml === "ok";

  // Pesos efectivos (renormalizados si falta algún motor, HU-18)
  const totalW = (rulesOk ? W_RULES : 0) + (bayesOk ? W_BAYES : 0) + (mlOk ? W_ML : 0);
  const renormalized = totalW < 0.999;

  // Contribuciones al score final (suman risk_score exacto)
  const subscore = result.rules_subscore ?? 0;
  const contribRules = rulesOk ? (W_RULES * subscore * 100) / totalW : 0;
  const contribBayes = bayesOk ? (W_BAYES * result.bayesian_probability * 100) / totalW : 0;
  const contribML = mlOk ? (W_ML * result.ml_probability * 100) / totalW : 0;

  // Información del umbral cruzado
  const strongCount = form.strong.filter(Boolean).length;
  const floorActive = strongCount >= 1;
  let thresholdNote: string;
  if (result.semaforo === "rojo" && strongCount >= 2) {
    thresholdNote = `Piso activado: ${strongCount} indicios fuertes → rojo directo`;
  } else if (result.semaforo === "amarillo" && strongCount >= 1) {
    thresholdNote = `Piso activado: 1 indicio fuerte → mínimo amarillo · score ${result.risk_score.toFixed(1)}`;
  } else if (result.semaforo === "verde") {
    thresholdNote = `${result.risk_score.toFixed(1)} < ${VERDE_MAX} → umbral verde`;
  } else if (result.semaforo === "amarillo") {
    thresholdNote = `${VERDE_MAX} ≤ ${result.risk_score.toFixed(1)} < ${AMARILLO_MAX} → umbral amarillo`;
  } else {
    thresholdNote = `${result.risk_score.toFixed(1)} ≥ ${AMARILLO_MAX} → umbral rojo`;
  }

  const sem = SEM_COLORS[result.semaforo];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Cabecera ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-coop-forest">
            account_tree
          </span>
          Árbol de decisión — Recorrido del motor híbrido
        </span>
        <span className="text-[10px] font-mono text-slate-500">Fusión ponderada</span>
      </div>

      <div className="p-4 flex flex-col">
        {/* ══ CAPA 1: Señales observadas ══════════════════════════════════════ */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Entrada · Señales observadas
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {activeWeak.length + activeStrong.length} activas
            </span>
          </div>

          <div className="p-3 flex gap-3">
            {/* Débiles */}
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                {activeWeak.length} señal(es) débil(es)
              </div>
              {activeWeak.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {activeWeak.map((label) => (
                    <span
                      key={label}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono leading-none"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Ninguna activa</span>
              )}
            </div>

            <div className="w-px bg-slate-200 self-stretch shrink-0" />

            {/* Fuertes */}
            <div className="flex-1 min-w-0">
              <div
                className={`text-[9px] font-mono font-semibold mb-1.5 flex items-center gap-1 ${activeStrong.length > 0 ? "text-rose-700" : "text-slate-400"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${activeStrong.length > 0 ? "bg-rose-500" : "bg-slate-300"}`}
                />
                {activeStrong.length} indicio(s) fuerte(s)
              </div>
              {activeStrong.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {activeStrong.map((label) => (
                    <span
                      key={label}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono font-semibold leading-none"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Ninguno activo</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Conector: bifurcación a los 3 motores ── */}
        <ForkArrows />

        {/* ══ CAPA 2: Tres motores ════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-2">
          <EngineCard
            icon="fact_check"
            iconColor="text-emerald-700"
            borderColor="border-emerald-200"
            bgColor="bg-emerald-50/40"
            headerBg="bg-emerald-50"
            name="Reglas"
            subtitle="Simbólico"
            status={rulesOk ? "ok" : "missing"}
            weightPct={Math.round(W_RULES * 100)}
            metricLabel="Subscore 0–1"
            metricValue={subscore.toFixed(3)}
            contribution={contribRules}
          />
          <EngineCard
            icon="hub"
            iconColor="text-sky-600"
            borderColor="border-sky-200"
            bgColor="bg-sky-50/40"
            headerBg="bg-sky-50"
            name="Bayesiana"
            subtitle="pgmpy"
            status={bayesOk ? "ok" : "missing"}
            weightPct={Math.round(W_BAYES * 100)}
            metricLabel="P(Fraude | E)"
            metricValue={`${(result.bayesian_probability * 100).toFixed(2)}%`}
            contribution={contribBayes}
          />
          <EngineCard
            icon="psychology"
            iconColor="text-indigo-600"
            borderColor="border-indigo-200"
            bgColor="bg-indigo-50/40"
            headerBg="bg-indigo-50"
            name="ML"
            subtitle="XGBoost"
            status={mlOk ? "ok" : "missing"}
            weightPct={Math.round(W_ML * 100)}
            metricLabel="P_ml (calibrada)"
            metricValue={`${(result.ml_probability * 100).toFixed(2)}%`}
            contribution={contribML}
          />
        </div>

        {/* ── Conector: convergencia hacia fusión ── */}
        <MergeArrows />

        {/* ══ CAPA 3: Fusión ponderada ════════════════════════════════════════ */}
        <div className="border border-violet-200 rounded-lg overflow-hidden">
          <div className="bg-violet-50 px-3 py-1.5 border-b border-violet-200 flex items-center justify-between">
            <span className="text-[9px] font-mono font-semibold text-violet-700 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">merge</span>
              Fusión ponderada
            </span>
            <span className="text-[9px] font-mono text-violet-500">S = Σ(wᵢ · pᵢ) / Σwᵢ × 100</span>
          </div>

          <div className="p-3 bg-violet-50/20 flex flex-col gap-2">
            {/* Fórmula con valores reales */}
            <div className="flex items-center gap-1 flex-wrap font-mono text-xs leading-relaxed">
              {rulesOk && (
                <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200 leading-none">
                  {(W_RULES * subscore).toFixed(4)}
                </span>
              )}
              {rulesOk && (bayesOk || mlOk) && (
                <span className="text-slate-400 leading-none">+</span>
              )}
              {bayesOk && (
                <span className="bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded border border-sky-200 leading-none">
                  {(W_BAYES * result.bayesian_probability).toFixed(4)}
                </span>
              )}
              {bayesOk && mlOk && <span className="text-slate-400 leading-none">+</span>}
              {mlOk && (
                <span className="bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200 leading-none">
                  {(W_ML * result.ml_probability).toFixed(4)}
                </span>
              )}
              <span className="text-slate-400 leading-none">÷</span>
              <span className="text-slate-600 leading-none">{totalW.toFixed(2)}</span>
              <span className="text-slate-400 leading-none">× 100</span>
              <span className="text-slate-400 leading-none">=</span>
              <span className="bg-violet-100 text-violet-900 px-2 py-0.5 rounded border border-violet-300 font-bold text-sm leading-none">
                {result.risk_score.toFixed(2)}
              </span>
              {renormalized && (
                <span className="text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                  pesos renormalizados
                </span>
              )}
            </div>

            {/* Barra apilada de contribuciones */}
            <div className="flex flex-col gap-1">
              <div className="relative h-4 rounded-full overflow-hidden bg-slate-100 flex">
                {rulesOk && (
                  <div
                    className="bg-emerald-500 h-full transition-all duration-700 ease-out"
                    style={{ width: `${contribRules}%` }}
                    title={`Reglas: ${contribRules.toFixed(2)} pts`}
                  />
                )}
                {bayesOk && (
                  <div
                    className="bg-sky-500 h-full transition-all duration-700 ease-out"
                    style={{ width: `${contribBayes}%` }}
                    title={`Bayesiana: ${contribBayes.toFixed(2)} pts`}
                  />
                )}
                {mlOk && (
                  <div
                    className="bg-indigo-500 h-full transition-all duration-700 ease-out"
                    style={{ width: `${contribML}%` }}
                    title={`ML: ${contribML.toFixed(2)} pts`}
                  />
                )}
                {/* Marcas de umbral */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/70"
                  style={{ left: `${VERDE_MAX}%` }}
                  title="Umbral verde/amarillo = 20"
                />
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/70"
                  style={{ left: `${AMARILLO_MAX}%` }}
                  title="Umbral amarillo/rojo = 65"
                />
              </div>
              {/* Leyenda */}
              <div className="flex justify-between text-[9px] font-mono">
                <div className="flex items-center gap-2">
                  {rulesOk && (
                    <span className="flex items-center gap-0.5 text-emerald-700">
                      <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
                      Reglas {contribRules.toFixed(1)}
                    </span>
                  )}
                  {bayesOk && (
                    <span className="flex items-center gap-0.5 text-sky-700">
                      <span className="w-2 h-2 rounded-sm bg-sky-500 inline-block" />
                      Bayes {contribBayes.toFixed(1)}
                    </span>
                  )}
                  {mlOk && (
                    <span className="flex items-center gap-0.5 text-indigo-700">
                      <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />
                      ML {contribML.toFixed(1)}
                    </span>
                  )}
                </div>
                <span className="text-slate-400">/ 100 pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Conector ── */}
        <DownArrow />

        {/* ══ CAPA 4: Veredicto ═══════════════════════════════════════════════ */}
        <div className={`border ${sem.border} rounded-lg overflow-hidden ring-1 ${sem.ring}`}>
          <div
            className={`${sem.bg} px-3 py-1.5 border-b ${sem.border} flex items-center justify-between`}
          >
            <span
              className={`text-[9px] font-mono font-semibold uppercase tracking-wider ${sem.text} flex items-center gap-1.5`}
            >
              <span className="material-symbols-outlined text-[13px]">flag</span>
              Veredicto final
            </span>
            {floorActive && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                piso activo
              </span>
            )}
          </div>

          <div className={`${sem.bg}/30 p-3 flex flex-col gap-2`}>
            {/* Badge del semáforo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full ${sem.dot} ring-2 ring-offset-1 ${sem.ring}`}
                />
                <span className={`text-lg font-bold font-mono ${sem.text}`}>{sem.label}</span>
              </div>
              <span className="font-mono text-2xl font-bold text-slate-900">
                {result.risk_score.toFixed(1)}
                <span className="text-xs font-normal text-slate-400"> / 100</span>
              </span>
            </div>

            {/* Regla que se aplicó */}
            <div
              className={`text-[10px] font-mono ${sem.text} bg-white/60 rounded px-2 py-1 border ${sem.border}`}
            >
              {thresholdNote}
            </div>

            {/* Escala de umbrales */}
            <div className="flex flex-col gap-0.5">
              <div className="relative h-3 rounded-full overflow-hidden flex">
                {/* Verde: 0–20 */}
                <div className="bg-emerald-400 h-full" style={{ width: `${VERDE_MAX}%` }} />
                {/* Amarillo: 20–65 */}
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${AMARILLO_MAX - VERDE_MAX}%` }}
                />
                {/* Rojo: 65–100 */}
                <div className="bg-rose-500 h-full" style={{ width: `${100 - AMARILLO_MAX}%` }} />
                {/* Indicador del score */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-md rounded-full border border-slate-400/40 transition-all duration-700"
                  style={{
                    left: `calc(${Math.min(99, result.risk_score)}% - 2px)`,
                  }}
                  title={`Score: ${result.risk_score}`}
                />
              </div>
              <div className="flex text-[8px] font-mono text-slate-400">
                <span style={{ width: `${VERDE_MAX}%` }}>0</span>
                <span style={{ width: `${AMARILLO_MAX - VERDE_MAX}%` }}>{VERDE_MAX}</span>
                <span style={{ width: `${100 - AMARILLO_MAX}%` }}>{AMARILLO_MAX}</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
