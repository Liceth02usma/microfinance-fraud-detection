import { TODAS_LAS_REGLAS, type Rule } from "../../data/rules";
import type { FormState } from "./types";

interface Props {
  form: FormState;
}

function isRuleActive(rule: Rule, form: FormState): boolean {
  if (rule.signalKind === "weak" && rule.signalIndex !== undefined) {
    return form.weak[rule.signalIndex] ?? false;
  }
  if (rule.signalKind === "strong" && rule.signalIndex !== undefined) {
    return form.strong[rule.signalIndex] ?? false;
  }
  if (rule.id === "R-SAFE-01") return form.zona === "rural" && form.strong.every((s) => !s);
  if (rule.id === "R-SAFE-02") return form.esEstacional;
  if (rule.id === "R-SAFE-03") return form.zona === "rural";
  if (rule.id === "R-BIAS-01") return form.genero === "femenino" && form.zona === "rural";
  return false;
}

export default function Col2Reglas({ form }: Props) {
  const activadas = TODAS_LAS_REGLAS.filter((r) => isRuleActive(r, form)).length;

  return (
    <section
      aria-label="Base de conocimiento y reglas"
      className="lg:col-span-4 flex flex-col gap-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-full">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-coop-forest flex items-center justify-center border border-emerald-200/60">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Motor Simbólico y Base Formal
              </h2>
              <p className="text-[11px] text-slate-500">Reglas expertas en sintaxis DSL</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
            {activadas} activadas / {TODAS_LAS_REGLAS.length}
          </span>
        </div>

        {/* Metadatos */}
        <div className="py-2.5 text-xs text-slate-600 flex items-center justify-between border-b border-slate-100 bg-slate-50/60 -mx-4 px-4">
          <span className="text-[11px] text-slate-500">
            Ponderaciones auditadas bajo W3C PROV-O
          </span>
          <span className="text-[10px] font-mono text-slate-600">SARC / SARO</span>
        </div>

        {/* Lista de reglas */}
        <div className="space-y-2 overflow-y-auto max-h-[760px] pr-1 mt-3 flex-1">
          {TODAS_LAS_REGLAS.map((regla) => {
            const activa = isRuleActive(regla, form);
            const badgeColor = activa
              ? regla.tipo === "fuerte"
                ? "text-rose-800 font-bold"
                : regla.tipo === "debil"
                  ? "text-amber-800 font-bold"
                  : "text-emerald-900 font-bold"
              : "text-slate-400";
            const cardClass = activa
              ? regla.tipo === "fuerte"
                ? "p-2.5 rounded-lg bg-rose-50/70 border-l-[3px] border-rose-600 border-r border-t border-b border-rose-200 text-slate-900"
                : regla.tipo === "debil"
                  ? "p-2.5 rounded-lg bg-amber-50/60 border-l-[3px] border-amber-500 border-r border-t border-b border-amber-200 text-slate-900"
                  : "p-2.5 rounded-lg bg-emerald-50/70 border-l-[3px] border-coop-forest border-r border-t border-b border-emerald-200 text-slate-900"
              : "p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-400 opacity-60";

            return (
              <div key={regla.id} className={cardClass}>
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className={badgeColor}>{regla.id}</span>
                  <span
                    className={`text-[10px] ${activa ? "text-slate-700 font-semibold" : "text-slate-400"}`}
                  >
                    {regla.peso !== 0
                      ? `peso: ${regla.peso > 0 ? "+" : ""}${regla.peso.toFixed(2)}`
                      : "evaluación"}
                  </span>
                </div>
                <p
                  className={`font-mono text-[11px] font-medium leading-snug ${activa ? "text-slate-900" : "text-slate-500"}`}
                >
                  {regla.cond} → {regla.acc}
                </p>
                <p
                  className={`text-[11px] mt-1 leading-snug ${activa ? "text-slate-600" : "text-slate-400"}`}
                >
                  {regla.just}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pie */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Ontología: W3C PROV-O</span>
          <span>Inferencia determinista</span>
        </div>
      </div>
    </section>
  );
}
