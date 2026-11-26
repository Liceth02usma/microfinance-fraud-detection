import { useRef, useState } from "react";
import type {
  EvaluationRequest,
  EvaluationResponse,
  KnowledgeResponse,
} from "../../api/types/evaluation.types";
import { MaterialIcon } from "../../components/MaterialIcon";
import { useKnowledge } from "../../hooks/useKnowledge";
import Col2Reglas from "./Col2Reglas";
import DecisionTreePanel from "./DecisionTreePanel";
import ModelReasoningPanel from "./ModelReasoningPanel";
import SaveValuationPanel from "./SaveValuationPanel";
import type { FormState } from "./types";

interface Props {
  status: "idle" | "loading" | "success" | "error";
  result: EvaluationResponse | null;
  /** Solicitud exacta que produjo `result` (se guarda con la valoración). */
  request: EvaluationRequest | null;
  errorMsg: string | null;
  form: FormState;
}

type Fusion = KnowledgeResponse["fusion"];

function buildLog(result: EvaluationResponse, fusion?: Fusion, totalRules?: number): string[] {
  const rules = result.activated_rules ?? [];
  const lines: string[] = [
    totalRules ? `[REGLAS] Evaluando ${totalRules} reglas...` : "[REGLAS] Evaluando reglas...",
    `[REGLAS] ${rules.length} regla(s) activada(s)`,
  ];
  rules.forEach((r) => {
    lines.push(
      `[REGLAS] ${r.id_regla}: peso ${r.peso.toFixed(2)} — ${r.justificacion.slice(0, 55)}...`,
    );
  });
  lines.push(`[BAYES]  P(Fraude | evidencia) = ${(result.bayesian_probability * 100).toFixed(2)}%`);
  lines.push(`[ML]     Probabilidad XGBoost: ${(result.ml_probability * 100).toFixed(2)}%`);
  lines.push(`[REGLAS] Subpuntaje: ${result.rules_subscore.toFixed(2)}`);
  if (fusion) {
    const w = fusion.weights;
    lines.push(
      `[FUSION] S = ${w.rules.toFixed(2)}×${result.rules_subscore.toFixed(2)} + ${w.bayesian.toFixed(2)}×${result.bayesian_probability.toFixed(4)} + ${w.ml.toFixed(2)}×${result.ml_probability.toFixed(4)} → ${result.risk_score}/100`,
    );
  }
  lines.push(`[VERSION] Modelo ${result.model_version}`);
  lines.push(`[VEREDICTO] ${result.semaforo.toUpperCase()} · Puntaje ${result.risk_score}/100`);
  return lines;
}

const SEMAFORO_CONFIG = {
  verde: {
    arc: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
    label: "Verde · Riesgo bajo",
    titleColor: "text-emerald-800",
    title: "Riesgo bajo",
    subtitle:
      "No hay indicios fuertes y las señales presentes no bastan para sospechar fraude. Sugerencia: continuar el trámite.",
    context: "Riesgo bajo",
    contextClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  amarillo: {
    arc: "text-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "Amarillo · Revisión",
    titleColor: "text-amber-800",
    title: "Requiere revisión del analista",
    subtitle:
      "Hay evidencia que conviene verificar (por ejemplo, un indicio fuerte). Sugerencia: revisar o enviar al comité.",
    context: "Revisión requerida",
    contextClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  rojo: {
    arc: "text-rose-600",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-600",
    label: "Rojo · Alerta alta",
    titleColor: "text-rose-800",
    title: "Alerta alta de fraude",
    subtitle:
      "Varios indicios fuertes o un puntaje alto. Sugerencia: no aprobar sin verificación completa del comité.",
    context: "Alerta objetiva de fraude",
    contextClass: "bg-rose-50 text-rose-900 border-rose-200",
  },
};

// ── Mini indicador de un motor en la tarjeta de veredicto ───────────────────

interface EngineTileProps {
  label: string;
  value: string;
  ratio: number;
  bar: string;
  status?: string;
}

function EngineTile({ label, value, ratio, bar, status }: EngineTileProps) {
  const missing = status === "missing";
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2.5">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>{label}</span>
        <span
          className={`flex items-center gap-1 ${missing ? "text-orange-700" : "text-emerald-700"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${missing ? "bg-orange-500" : "bg-emerald-500"}`}
          />
          {status ?? "ok"}
        </span>
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums text-slate-900">
        {missing ? "—" : value}
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-1 rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${missing ? 0 : Math.min(100, ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Pestañas ────────────────────────────────────────────────────────────────

type TabKey = "razonamiento" | "factores" | "recorrido" | "reglas" | "traza" | "registrar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "razonamiento", label: "Razonamiento de los modelos" },
  { key: "factores", label: "Factores" },
  { key: "recorrido", label: "Recorrido" },
  { key: "reglas", label: "Reglas" },
  { key: "traza", label: "Traza" },
  { key: "registrar", label: "Registrar decisión" },
];

function Pending({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

/**
 * Columna de resultado: tarjeta de veredicto siempre visible y, debajo, el
 * detalle organizado en pestañas. Todas las pestañas permanecen montadas
 * (las inactivas con `hidden`) para no perder el estado del formulario de
 * decisión humana al navegar entre ellas.
 */
export default function Col3Resultado({ status, result, request, errorMsg, form }: Props) {
  const logRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tab, setTab] = useState<TabKey>("razonamiento");
  const knowledge = useKnowledge();
  const fusion = knowledge.data?.fusion;
  const totalRules = knowledge.data?.rules.length;

  function copyLog() {
    if (!result) return;
    const text = buildLog(result, fusion, totalRules).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  /** Navegación con flechas entre pestañas (patrón WAI-ARIA Tabs). */
  function onTabKey(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  }

  const cfg = result ? SEMAFORO_CONFIG[result.semaforo] : null;
  const ok = status === "success" && result !== null;
  const pendingMsg = "Evalúa la solicitud para ver este detalle.";

  return (
    <section aria-label="Resultado y explicabilidad" className="flex flex-col gap-4">
      {status === "error" && errorMsg && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
        >
          <MaterialIcon name="warning" className="text-[16px]" />
          {errorMsg}
        </div>
      )}

      {/* Veredicto */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Veredicto global de riesgo</h2>
          {cfg && (
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
        </div>

        {status === "idle" && (
          <p className="py-6 text-center text-sm text-slate-400">
            Esperando señales para iniciar la evaluación...
          </p>
        )}
        {status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-6 text-sm text-slate-500">
            <MaterialIcon name="refresh" className="animate-spin text-[20px] text-coop-pine" />
            Evaluando con motor híbrido...
          </div>
        )}
        {(status === "success" || status === "error") && result && cfg && (
          <div className="flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className={`${cfg.arc} transition-all duration-700 ease-out`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${result.risk_score}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold leading-none tabular-nums text-slate-900">
                  {result.risk_score}
                </span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className={`text-lg font-semibold ${cfg.titleColor}`}>{cfg.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{cfg.subtitle}</p>
            </div>
          </div>
        )}

        {ok && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">Desglose de motores híbridos</p>
            <div className="grid grid-cols-3 gap-2">
              <EngineTile
                label="Reglas"
                value={result.rules_subscore.toFixed(2)}
                ratio={result.rules_subscore}
                bar="bg-emerald-700"
                status={result.engine_status?.rules}
              />
              <EngineTile
                label="Red bayesiana"
                value={`${(result.bayesian_probability * 100).toFixed(2)}%`}
                ratio={result.bayesian_probability}
                bar="bg-trust-blue"
                status={result.engine_status?.bayesian}
              />
              <EngineTile
                label="Modelo ML"
                value={`${(result.ml_probability * 100).toFixed(2)}%`}
                ratio={result.ml_probability}
                bar="bg-indigo-500"
                status={result.engine_status?.ml}
              />
            </div>
          </div>
        )}

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <MaterialIcon name="verified_user" className="text-[16px] text-coop-forest" />
          <span>
            <strong className="font-semibold text-slate-700">Humano en el bucle:</strong> el sistema
            recomienda; la decisión final la toma y registra el analista.
            {ok ? <span className="font-mono"> · Modelo {result.model_version}</span> : null}
          </span>
        </p>
      </div>

      {/* Pestañas de detalle */}
      <div>
        <div
          role="tablist"
          aria-label="Detalle de la evaluación"
          className="flex gap-1 overflow-x-auto border-b border-slate-200"
        >
          {TABS.map((t, i) => {
            const selected = tab === t.key;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={selected}
                aria-controls={`panel-${t.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                  selected
                    ? "border-coop-forest font-semibold text-coop-forest"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="pt-4">
          <div
            role="tabpanel"
            id="panel-razonamiento"
            aria-labelledby="tab-razonamiento"
            hidden={tab !== "razonamiento"}
          >
            {ok ? (
              <ModelReasoningPanel result={result} fusion={fusion} />
            ) : (
              <Pending>{pendingMsg}</Pending>
            )}
          </div>

          <div
            role="tabpanel"
            id="panel-factores"
            aria-labelledby="tab-factores"
            hidden={tab !== "factores"}
          >
            {ok && cfg ? (
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Factores explicativos del dictamen
                  </h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.contextClass}`}
                  >
                    {cfg.context}
                  </span>
                </div>
                <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-slate-700">
                  {result.explanatory_factors.map((factor, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: factor }} />
                  ))}
                </ol>
              </div>
            ) : (
              <Pending>{pendingMsg}</Pending>
            )}
          </div>

          <div
            role="tabpanel"
            id="panel-recorrido"
            aria-labelledby="tab-recorrido"
            hidden={tab !== "recorrido"}
          >
            {ok ? (
              <DecisionTreePanel form={form} result={result} />
            ) : (
              <Pending>{pendingMsg}</Pending>
            )}
          </div>

          <div
            role="tabpanel"
            id="panel-reglas"
            aria-labelledby="tab-reglas"
            hidden={tab !== "reglas"}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <Col2Reglas form={form} result={ok ? result : null} />
          </div>

          <div
            role="tabpanel"
            id="panel-traza"
            aria-labelledby="tab-traza"
            hidden={tab !== "traza"}
          >
            <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#0B141B] p-4 text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                  <MaterialIcon name="terminal" className="text-[15px]" />
                  Traza de razonamiento
                </span>
                <button
                  className="flex items-center gap-1 font-mono text-[11px] text-slate-400 transition-colors hover:text-white"
                  onClick={copyLog}
                  type="button"
                >
                  <MaterialIcon name="content_copy" className="text-[13px]" />
                  Copiar
                </button>
              </div>
              <div
                ref={logRef}
                className="max-h-80 space-y-1.5 overflow-y-auto pr-1 font-mono text-[11px] leading-snug"
              >
                {status === "idle" && (
                  <span className="text-slate-500">
                    // Esperando señales para iniciar la evaluación...
                  </span>
                )}
                {status === "loading" && (
                  <span className="animate-pulse text-emerald-400">
                    Evaluando reglas, red bayesiana y modelo ML...
                  </span>
                )}
                {ok &&
                  buildLog(result, fusion, totalRules).map((line, i) => {
                    const color = line.startsWith("[VEREDICTO]")
                      ? result.semaforo === "verde"
                        ? "text-emerald-400"
                        : result.semaforo === "amarillo"
                          ? "text-amber-400"
                          : "text-rose-400"
                      : line.startsWith("[BAYES]")
                        ? "text-sky-400"
                        : line.startsWith("[ML]")
                          ? "text-indigo-400"
                          : line.startsWith("[FUSION]")
                            ? "text-emerald-300"
                            : "text-slate-300";
                    return (
                      <div key={i} className={color}>
                        {line}
                      </div>
                    );
                  })}
                {status === "error" && (
                  <span className="text-rose-400">
                    [ERROR] {errorMsg ?? "Servicio no disponible. Intenta de nuevo."}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id="panel-registrar"
            aria-labelledby="tab-registrar"
            hidden={tab !== "registrar"}
          >
            {ok && request ? (
              <SaveValuationPanel key={request.id_solicitud} request={request} result={result} />
            ) : (
              <Pending>{pendingMsg}</Pending>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
