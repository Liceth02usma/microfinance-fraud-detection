import { MaterialIcon } from "../../../components/MaterialIcon";
import { SortableTable, type Column } from "../../../components/table/SortableTable";
import type { SystemComponent, SystemLayer } from "../data/components";
import { SYSTEM_COMPONENTS } from "../data/components";
import { SectionCard } from "./SectionCard";

/** Pastillas de color por capa (paleta del diseño). */
const LAYER_BADGES: Record<SystemLayer, string> = {
  Usuario: "border-trust-blue/30 bg-trust-blue/10 text-trust-blue",
  "Núcleo Híbrido": "border-bias-warning/30 bg-bias-warning/10 text-bias-warning",
  "Conocimiento & Ética": "border-primary-container/20 bg-brand-soft text-primary-container",
};

function layerBadge(layer: SystemLayer): string {
  return `inline-flex whitespace-nowrap rounded border px-2.5 py-1 text-[11px] font-semibold ${LAYER_BADGES[layer]}`;
}

const COLUMNS: Column<SystemComponent>[] = [
  {
    key: "component",
    header: "Componente",
    sortable: true,
    sortValue: (row) => row.name,
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
          <MaterialIcon name={row.icon} className="text-[18px]!" />
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-900">{row.name}</div>
          <div className="font-metric-data text-[11px] text-slate-500">{row.slug}</div>
        </div>
      </div>
    ),
  },
  {
    key: "layer",
    header: "Capa",
    sortable: true,
    sortValue: (row) => row.layer,
    cell: (row) => <span className={layerBadge(row.layer)}>{row.layer}</span>,
  },
  {
    key: "technology",
    header: "Tecnología",
    sortable: true,
    sortValue: (row) => row.technology,
    cell: (row) => (
      <span className="inline-block whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 font-code-md text-xs text-slate-600">
        {row.technology}
      </span>
    ),
  },
  {
    key: "function",
    header: "Función",
    sortable: true,
    sortValue: (row) => row.function,
    cell: (row) => <p className="text-sm text-slate-600">{row.function}</p>,
  },
  {
    key: "interaction",
    header: "Interacción",
    sortable: true,
    sortValue: (row) => row.interaction,
    cell: (row) => (
      <div className="flex items-start gap-1.5 text-sm text-slate-700">
        <MaterialIcon name="swap_horiz" className="mt-0.5 shrink-0 text-[14px]! text-slate-400" />
        {row.interaction}
      </div>
    ),
  },
];

/** Sección A: matriz ordenable de los 9 componentes del sistema. */
export function ComponentsMatrix(): JSX.Element {
  return (
    <SectionCard
      icon="layers"
      title="A. Matriz de Componentes del Sistema"
      badge="9 Componentes · 3 Capas"
      subtitle="Inventario detallado de los módulos desacoplados y sus interacciones"
      right={
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="whitespace-nowrap rounded border border-trust-blue/30 bg-trust-blue/10 px-2.5 py-1 text-trust-blue">
            Usuario
          </span>
          <span className="whitespace-nowrap rounded border border-bias-warning/30 bg-bias-warning/10 px-2.5 py-1 text-bias-warning">
            Núcleo Híbrido
          </span>
          <span className="whitespace-nowrap rounded border border-primary-container/20 bg-brand-soft px-2.5 py-1 text-primary-container">
            Conocimiento &amp; Ética
          </span>
        </div>
      }
    >
      <SortableTable
        label="Matriz de componentes del sistema"
        rows={SYSTEM_COMPONENTS}
        rowKey={(row) => row.name}
        columns={COLUMNS}
      />
    </SectionCard>
  );
}
