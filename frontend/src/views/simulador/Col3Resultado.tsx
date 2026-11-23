import { useRef } from "react";
import type { EvaluationResponse } from "../../api/types/evaluation.types";

interface Props {
  status: "idle" | "loading" | "success" | "error";
  result: EvaluationResponse | null;
  errorMsg: string | null;
}

function buildLog(result: EvaluationResponse): string[] {
  const rules = result.activated_rules ?? [];
  const lines: string[] = [
    `[REGLAS] Evaluando ${24} reglas...`,
    `[REGLAS] ${rules.length} regla(s) activada(s)`,
  ];
  rules.forEach((r) => {
    lines.push(
      `[REGLAS] ${r.id_regla}: peso ${r.peso.toFixed(2)} — ${r.justificacion.slice(0, 55)}...`,
    );
  });
  lines.push(`[BAYES]  P(Fraude | evidencia) = ${(result.bayesian_probability * 100).toFixed(2)}%`);
  lines.push(`[ML]     Probabilidad XGBoost: ${(result.ml_probability * 100).toFixed(2)}%`);
  const rulesScore = Math.min(
    1,
    rules.reduce((s, r) => s + r.peso, 0),
  );
  lines.push(
    `[FUSION] S = 0.25×${rulesScore.toFixed(2)} + 0.35×${result.bayesian_probability.toFixed(4)} + 0.40×${result.ml_probability.toFixed(4)} → ${result.risk_score}/100`,
  );
  lines.push(`[VEREDICTO] ${result.semaforo.toUpperCase()} · Puntaje ${result.risk_score}/100`);
  return lines;
}

const SEMAFORO_CONFIG = {
  verde: {
    arc: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
    label: "Verde · Viable",
    titleColor: "text-emerald-800",
    title: "Riesgo bajo con viabilidad técnica",
    subtitle:
      "Solicitud compatible con esquema de amortización agraria y arraigo campesino verificado.",
    context: "Contexto rural",
    contextClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  amarillo: {
    arc: "text-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "Amarillo · Revisión HITL",
    titleColor: "text-amber-800",
    title: "Señal de alerta — inspección de campo requerida",
    subtitle:
      "Se detectó una señal fuerte de inconsistencia. El analista debe verificar presencialmente.",
    context: "Revisión requerida",
    contextClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  rojo: {
    arc: "text-rose-600",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-600",
    label: "Rojo · Rechazar / SARO",
    titleColor: "text-rose-800",
    title: "Alerta severa de inconsistencia objetiva",
    subtitle:
      "Se detectaron indicios de suplantación o falsedad material. Se remite al oficial de cumplimiento SARO.",
    context: "Alerta objetiva de fraude",
    contextClass: "bg-rose-50 text-rose-900 border-rose-200",
  },
};

export default function Col3Resultado({ status, result, errorMsg }: Props) {
  const logRef = useRef<HTMLDivElement>(null);

  function copyLog() {
    if (!result) return;
    const text = buildLog(result).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const cfg = result ? SEMAFORO_CONFIG[result.semaforo] : null;
  const rulesScore = result
    ? Math.min(
        1,
        (result.activated_rules ?? []).reduce((s, r) => s + r.peso, 0),
      )
    : 0;

  return (
    <section aria-label="Resultado y explicabilidad" className="lg:col-span-4 flex flex-col gap-4">
      {/* Error banner 503/red */}
      {status === "error" && errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          {errorMsg}
        </div>
      )}

      {/* Card de decisión */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-coop-forest">
              analytics
            </span>
            Veredicto global de riesgo
          </span>
          {cfg && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium font-mono border flex items-center gap-1 ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
        </div>

        {/* Gauge + texto */}
        {status === "idle" && (
          <p className="font-mono text-xs text-slate-400 py-6 text-center">
            // Esperando señales para iniciar la evaluación...
          </p>
        )}
        {status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-6 text-slate-500 text-xs">
            <span className="material-symbols-outlined animate-spin text-[20px] text-coop-pine">
              refresh
            </span>
            Evaluando con motor híbrido...
          </div>
        )}
        {(status === "success" || status === "error") && result && cfg && (
          <div className="flex items-center gap-4 py-2">
            {/* SVG gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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
                <span className="font-code-md text-2xl font-bold text-slate-900 leading-none">
                  {result.risk_score}
                </span>
                <span className="text-[9px] font-code-md text-slate-500">Riesgo / 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className={`text-base font-bold ${cfg.titleColor}`}>{cfg.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{cfg.subtitle}</p>
            </div>
          </div>
        )}

        {/* HU-09 siempre visible */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-coop-forest shrink-0 mt-0.5">
            verified_user
          </span>
          <div>
            <strong className="font-semibold text-slate-900">
              Principio Humano-en-el-Bucle (HU-09):
            </strong>{" "}
            La recomendación de la IA asiste al analista; la resolución final es de atribución
            humana.
          </div>
        </div>
      </div>

      {/* Desglose de motores */}
      {status === "success" && result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">
              Desglose de motores híbridos
            </span>
            <span className="text-[10px] font-mono text-slate-500">3 componentes</span>
          </div>

          {/* Bayesiana */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-trust-blue">hub</span>
                Red Bayesiana (pgmpy)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-slate-900">
                  P(Fraude) = {(result.bayesian_probability * 100).toFixed(2)}%
                </span>
                <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200">
                  {result.engine_status?.bayesian ?? "ok"}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-trust-blue h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${result.bayesian_probability * 100}%` }}
              />
            </div>
          </div>

          {/* ML */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-indigo-600">
                  psychology
                </span>
                Modelo ML (XGBoost + SHAP)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-slate-900">
                  P_ml = {(result.ml_probability * 100).toFixed(2)}%
                </span>
                <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200">
                  {result.engine_status?.ml ?? "ok"}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-container h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${result.ml_probability * 100}%` }}
              />
            </div>
          </div>

          {/* Reglas */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">
                  fact_check
                </span>
                Motor Simbólico (Reglas)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-slate-900">
                  Sub-score: {rulesScore.toFixed(2)} / 1.00
                </span>
                <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200">
                  {result.engine_status?.rules ?? "ok"}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-700 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, rulesScore * 100)}%` }}
              />
            </div>
          </div>

          {/* Fórmula de fusión */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-code-md text-[11px] text-slate-700 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Fórmula de fusión calibrada</span>
              <span>Pesos auditados</span>
            </div>
            <div className="text-slate-900 font-medium">
              S = 0.25·S_reglas + 0.35·P_bayes + 0.40·P_ml
            </div>
          </div>
        </div>
      )}

      {/* Factores explicativos */}
      {status === "success" && result && cfg && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">
              Factores explicativos del dictamen
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${cfg.contextClass}`}
            >
              {cfg.context}
            </span>
          </div>
          <ol className="space-y-2 text-xs text-slate-700 list-decimal pl-4 leading-relaxed">
            {result.explanatory_factors.map((factor, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: factor }} />
            ))}
          </ol>
        </div>
      )}

      {/* Terminal de auditoría */}
      <div className="bg-[#0B141B] rounded-xl border border-slate-800 shadow-sm p-3.5 flex flex-col gap-2 text-slate-300">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">terminal</span>
            Traza de razonamiento en tiempo real
          </span>
          <button
            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            onClick={copyLog}
            type="button"
          >
            <span className="material-symbols-outlined text-[13px]">content_copy</span>
            Copiar
          </button>
        </div>
        <div
          ref={logRef}
          className="font-mono text-[11px] h-44 overflow-y-auto space-y-1.5 pr-1 text-slate-300 leading-snug"
        >
          {status === "idle" && (
            <span className="text-slate-500">
              // Esperando señales para iniciar la evaluación...
            </span>
          )}
          {status === "loading" && (
            <span className="text-emerald-400 animate-pulse">
              Procesando tensores y reglas de conocimiento...
            </span>
          )}
          {status === "success" &&
            result &&
            buildLog(result).map((line, i) => {
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
    </section>
  );
}
