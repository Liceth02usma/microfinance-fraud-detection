import { MaterialIcon } from "../../../components/MaterialIcon";
import { SortableTable, type Column } from "../../../components/table/SortableTable";
import type { HumanRole } from "../data/components";
import { HUMAN_ROLES } from "../data/components";
import { SectionCard } from "./SectionCard";

const COLUMNS: Column<HumanRole>[] = [
  {
    key: "role",
    header: "Rol",
    sortable: true,
    sortValue: (row) => row.role,
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800">
          <MaterialIcon name={row.icon} className="text-[18px]!" />
        </span>
        <span className="font-semibold text-slate-900">{row.role}</span>
      </div>
    ),
  },
  {
    key: "responsibility",
    header: "Responsabilidad Principal",
    cell: (row) => <p className="text-sm text-slate-600">{row.responsibility}</p>,
  },
  {
    key: "decisions",
    header: "Decisiones",
    cell: (row) => <p className="text-sm text-slate-800">{row.decisions}</p>,
  },
  {
    key: "hus",
    header: "HU",
    cell: (row) => (
      <div className="flex flex-wrap items-center gap-1.5">
        {row.hus.map((hu) => (
          <span
            key={hu}
            className="whitespace-nowrap rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-metric-data text-[11px] text-slate-700"
          >
            {hu}
          </span>
        ))}
      </div>
    ),
  },
];

/** Sección D: roles humanos y la nota de trazabilidad W3C PROV-O (HU-26). */
export function HumanRoles(): JSX.Element {
  return (
    <SectionCard
      icon="groups"
      title="D. Roles Humanos y Trazabilidad (W3C PROV-O)"
      badge="6 Roles Operativos"
      subtitle="El sistema recomienda; el humano decide. Toda decisión queda registrada con usuario, hora y modelo (HU-09, HU-26)."
    >
      <SortableTable
        label="Roles humanos, responsabilidades y decisiones"
        rows={HUMAN_ROLES}
        rowKey={(row) => row.role}
        columns={COLUMNS}
      />

      <div className="px-6 py-5 lg:px-8">
        <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900">
          <MaterialIcon name="warning_amber" className="mt-0.5 shrink-0 text-[18px]!" />
          <div>
            <p className="text-xs font-bold">Trazabilidad Obligatoria (W3C PROV-O)</p>
            <p className="mt-1 text-xs leading-relaxed text-sky-800">
              Toda decisión humana es un Evento «wasGeneratedBy» vinculado a la solicitud y el
              analista. Cualquier decisión debe justificarse en bitácora inmutable (HU-26).
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
