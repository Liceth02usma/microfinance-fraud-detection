import { useState } from "react";
import type { EvaluationResponse, KnowledgeRule } from "../../api/types/evaluation.types";
import { STRONG_SIGNAL_NAMES, WEAK_SIGNAL_NAMES } from "../../data/signals";
import { useKnowledge } from "../../hooks/useKnowledge";
import type { FormState } from "./types";

interface Props {
  form: FormState;
  /** Resultado de la última evaluación: si existe, manda sobre la vista previa. */
  result?: EvaluationResponse | null;
}

/**
 * Vista previa de activación mientras el analista marca señales. Replica las
 * condiciones de `knowledge/reglas.yaml`; tras evaluar se usan las reglas que
 * devolvió el backend (fuente de verdad).
 */
function previewActive(rule: KnowledgeRule, form: FormState): boolean {
  const noStrong = form.strong.every((s) => !s);
  if (rule.senal) {
    const weakIdx = (WEAK_SIGNAL_NAMES as readonly string[]).indexOf(rule.senal);
    if (weakIdx >= 0) return form.weak[weakIdx] ?? false;
    const strongIdx = (STRONG_SIGNAL_NAMES as readonly string[]).indexOf(rule.senal);
    if (strongIdx >= 0) return form.strong[strongIdx] ?? false;
  }
  if (rule.id === "R-SAFE-01") return form.zona === "rural" && noStrong;
  if (rule.id === "R-SAFE-02") return form.esEstacional && noStrong;
  if (rule.id === "R-SAFE-03") {
    return (
      (form.tipoNegocio === "parcela_finca" || form.tipoNegocio === "plaza_mercado_feria") &&
      noStrong
    );
  }
  if (rule.id === "R-BIAS-01") return form.genero === "femenino" && form.zona === "rural";
  return false;
}

const CATEGORY_STYLE: Record<string, { card: string; id: string }> = {
  fuerte: { card: "bg-risk-high/8 border-l-[3px] border-risk-high", id: "text-rose-800" },
  debil: { card: "bg-risk-medium/8 border-l-[3px] border-risk-medium", id: "text-amber-800" },
  salvaguarda: {
    card: "bg-emerald-50/70 border-l-[3px] border-coop-forest",
    id: "text-emerald-900",
  },
  bias: { card: "bg-sky-50/70 border-l-[3px] border-sky-500", id: "text-sky-900" },
};

function RuleCard({ rule, active }: { rule: KnowledgeRule; active: boolean }) {
  const style = CATEGORY_STYLE[rule.categoria] ?? CATEGORY_STYLE.bias;
  return (
    <div
      className={
        active
          ? `p-2.5 rounded-lg ${style.card} text-slate-900`
          : "p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-500"
      }
    >
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className={`font-code-md font-semibold ${active ? style.id : "text-slate-500"}`}>
          {rule.id}
        </span>
        <span className="text-[11px] text-slate-600">
          {rule.peso !== 0
            ? `peso ${rule.peso > 0 ? "+" : ""}${rule.peso.toFixed(2)}`
            : "solo auditoría"}
        </span>
      </div>
      <p className="text-xs leading-snug">{rule.justificacion}</p>
    </div>
  );
}

/**
 * Columna de reglas expertas. Las reglas se leen de `GET /api/v1/knowledge`:
 * la interfaz no guarda una copia propia que pueda desalinearse del motor.
 * Las activas se muestran primero; las inactivas quedan plegadas.
 */
export default function Col2Reglas({ form, result }: Props) {
  const knowledge = useKnowledge();
  const [showInactive, setShowInactive] = useState(false);

  const rules = knowledge.data?.rules ?? [];
  const backendActive = result ? new Set(result.activated_rules?.map((r) => r.id_regla)) : null;
  const isActive = (rule: KnowledgeRule): boolean =>
    backendActive ? backendActive.has(rule.id) : previewActive(rule, form);
  const active = rules.filter(isActive);
  const inactive = rules.filter((r) => !isActive(r));

  return (
    <section aria-label="Reglas expertas" className="flex flex-col">
      <div className="flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Reglas expertas</h2>
            <p className="text-xs text-slate-500">
              {backendActive ? "Activadas en la evaluación" : "Vista previa según las señales"}
              {knowledge.data ? ` · base v${knowledge.data.rules_version}` : ""}
            </p>
          </div>
          {knowledge.data ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
              {active.length} de {rules.length}
            </span>
          ) : null}
        </div>

        {knowledge.status === "loading" ? (
          <p className="mt-3 text-sm text-slate-500">Cargando reglas del backend…</p>
        ) : null}
        {knowledge.status === "error" ? (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            No se pudieron cargar las reglas: {knowledge.error}. Verifica que el backend esté en
            ejecución.
          </p>
        ) : null}

        {knowledge.data ? (
          <div className="mt-3 flex flex-col gap-2">
            {active.length === 0 ? (
              <p className="text-sm text-slate-500">Ninguna regla activa con estas señales.</p>
            ) : (
              active.map((rule) => <RuleCard key={rule.id} rule={rule} active />)
            )}

            <button
              type="button"
              onClick={() => setShowInactive((v) => !v)}
              aria-expanded={showInactive}
              className="mt-1 self-start text-xs font-semibold text-primary hover:underline"
            >
              {showInactive
                ? "Ocultar reglas inactivas"
                : `Ver las ${inactive.length} reglas inactivas`}
            </button>
            {showInactive
              ? inactive.map((rule) => <RuleCard key={rule.id} rule={rule} active={false} />)
              : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
