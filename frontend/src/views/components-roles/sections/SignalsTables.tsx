import type { ReactNode } from "react";
import { MaterialIcon } from "../../../components/MaterialIcon";
import { SortableTable, type Column } from "../../../components/table/SortableTable";
import type { StrongIndicator, WeakSignal } from "../data/components";
import { STRONG_INDICATORS, WEAK_SIGNALS } from "../data/components";
import { SectionCard } from "./SectionCard";

const WEAK_COLUMNS: Column<WeakSignal>[] = [
  {
    key: "number",
    header: "#",
    cell: (row) => (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-100 font-metric-data text-[11px] font-semibold text-amber-800">
        {String(row.number).padStart(2, "0")}
      </span>
    ),
  },
  {
    key: "signal",
    header: "Señal",
    sortable: true,
    sortValue: (row) => row.name,
    cell: (row) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-900">{row.name}</span>
        <span className="w-fit rounded bg-amber-50 px-2 py-0.5 font-metric-data text-[11px] text-amber-700">
          {row.field}
        </span>
      </div>
    ),
  },
  {
    key: "ruralContext",
    header: "Contexto rural que la justifica",
    sortable: true,
    sortValue: (row) => row.ruralContext,
    cell: (row) => <p className="text-sm leading-relaxed text-slate-600">{row.ruralContext}</p>,
  },
];

const STRONG_COLUMNS: Column<StrongIndicator>[] = [
  {
    key: "number",
    header: "#",
    cell: (row) => (
      <span className="flex h-6 w-6 items-center justify-center rounded bg-red-100 font-metric-data text-[11px] font-semibold text-red-800">
        {String(row.number).padStart(2, "0")}
      </span>
    ),
  },
  {
    key: "indicator",
    header: "Indicador",
    sortable: true,
    sortValue: (row) => row.name,
    cell: (row) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-900">{row.name}</span>
        </div>
        <span className="ml-4 w-fit rounded bg-red-50 px-2 py-0.5 font-metric-data text-[11px] text-red-700">
          {row.field}
        </span>
      </div>
    ),
  },
  {
    key: "justification",
    header: "Justificación (Evidencia Directa)",
    sortable: true,
    sortValue: (row) => row.justification,
    cell: (row) => <p className="text-sm leading-relaxed text-slate-600">{row.justification}</p>,
  },
];

function SubSectionHeader({
  code,
  title,
  tone,
  right,
}: {
  code: string;
  title: string;
  tone: "weak" | "strong";
  right: ReactNode;
}): JSX.Element {
  const background = tone === "weak" ? "bg-amber-50/40" : "bg-red-50/30";
  const accent = tone === "weak" ? "text-amber-800" : "text-red-800";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 lg:px-8 ${background}`}
    >
      <h3 className={`text-sm font-bold ${accent}`}>
        {code} · {title}
      </h3>
      <div className="flex flex-wrap items-center gap-3">{right}</div>
    </div>
  );
}

/**
 * Sección B: señales débiles (13) con su contexto rural y
 * indicadores fuertes (6), más la salvaguarda ética HU-18.
 */
export function SignalsTables(): JSX.Element {
  return (
    <SectionCard
      icon="radar"
      title="B. Señales de Fraude: Débiles vs. Fuertes"
      badge="19 Total: 13 Débiles + 6 Fuertes"
      subtitle="La base del motor de reglas (R08–R16) y el detector de fraude documental (R01–R07)"
    >
      <SubSectionHeader
        code="B.1"
        title="Señales Débiles (Débiles no implican fraude)"
        tone="weak"
        right={
          <>
            <span className="rounded border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              Débil · Requiere Contexto Rural
            </span>
            <span className="font-metric-data text-[11px] text-slate-500">13 Señales</span>
          </>
        }
      />

      <div className="px-6 pt-5 lg:px-8">
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          <MaterialIcon name="verified" className="mt-0.5 shrink-0 text-[18px]!" />
          <div>
            <p className="text-xs font-bold">
              Salvaguarda Ética: El Motor de Reglas impone un techo acumulativo de 0.10 para la suma
              de señales débiles.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">
              Ninguna de estas señales puede derivar por sí sola en clasificación «roja». Coexistir
              múltiples señales débiles en un perfil rural solo justifica revisión manual
              (amarillo), nunca rechazo automático.
            </p>
          </div>
        </div>
      </div>

      <div className="pb-6">
        <SortableTable
          label="Señales débiles de fraude y su contexto rural"
          rows={WEAK_SIGNALS}
          rowKey={(row) => row.field}
          columns={WEAK_COLUMNS}
          hoverClassName="hover:bg-amber-50/50"
        />
      </div>

      <SubSectionHeader
        code="B.2"
        title="Indicadores Fuertes (Fraude Directo)"
        tone="strong"
        right={
          <>
            <span className="rounded border border-red-200 bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800">
              Fuerte · Alerta Crítica Directa
            </span>
            <span className="font-metric-data text-[11px] text-slate-500">6 Indicadores</span>
          </>
        }
      />

      <div className="pb-6">
        <SortableTable
          label="Indicadores fuertes de fraude directo"
          rows={STRONG_INDICATORS}
          rowKey={(row) => row.field}
          columns={STRONG_COLUMNS}
          hoverClassName="hover:bg-red-50/40"
        />
      </div>
    </SectionCard>
  );
}
