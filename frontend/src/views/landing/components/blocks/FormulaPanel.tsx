import type { FormulaBlock } from "../../data/types";
import { MaterialIcon } from "../../../../components/MaterialIcon";
import { DataTable } from "./DataTable";

/**
 * Panel oscuro de formulación bayesiana (sección 06): encabezado, expresiones
 * monoespaciadas, tres términos explicados y la tabla de razones de
 * verosimilitud moduladas por contexto territorial.
 */
export function FormulaPanel({ content }: { content: FormulaBlock }): JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-xl bg-slate-900 p-6 text-slate-100 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <MaterialIcon name="functions" className="text-primary-fixed" />
            <span className="font-label-lg font-bold tracking-wide text-primary-fixed">
              {content.title}
            </span>
          </div>
          <span className="rounded bg-slate-700 px-2 py-0.5 font-metric-data text-metric-data text-slate-300">
            {content.badge}
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-slate-700 bg-black/40 p-4 font-metric-data text-[14px] leading-relaxed">
          {content.expressions.map((expression, index) => (
            <p key={expression} className={index === 0 ? "text-primary-fixed" : "text-slate-300"}>
              {expression}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {content.terms.map((term) => (
            <div key={term.label} className="flex flex-col gap-1 rounded-lg bg-slate-700/60 p-3">
              <span className="font-label-md font-bold uppercase tracking-wider text-primary-fixed">
                {term.label}
              </span>
              <p className="font-metric-data text-[13px] text-slate-300">{term.formula}</p>
              <p className="text-[12px] leading-relaxed text-slate-400">{term.note}</p>
            </div>
          ))}
        </div>
      </div>

      <DataTable table={content.table} />
    </div>
  );
}
