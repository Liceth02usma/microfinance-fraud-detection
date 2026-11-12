import { MaterialIcon } from "../../../components/MaterialIcon";
import { SortableTable, type Column } from "../../../components/table/SortableTable";
import { useDisclosure } from "../../../hooks/useDisclosure";
import type { ProtectedVariable, Sensitivity } from "../data/components";
import { PROTECTED_VARIABLES } from "../data/components";
import { SectionCard } from "./SectionCard";

/** Pastilla de clasificación ética (HU-04). */
const SENSITIVITY_BADGES: Record<Sensitivity, string> = {
  Sensible: "bg-red-100 text-red-700",
  "Proxy potencial": "bg-amber-100 text-amber-700",
  Neutral: "bg-slate-100 text-slate-600",
};

/** Definiciones de la leyenda emergente (contrato 03 §3). */
const TAXONOMY: { term: string; definition: string }[] = [
  {
    term: "Sensible",
    definition:
      "variable protegida directa — NO se usa como input predictivo. Solo para auditoría ética (HU-04).",
  },
  {
    term: "Proxy potencial",
    definition:
      "puede actuar como sustituto de una variable sensible. Usada con cautela y monitoreo.",
  },
  {
    term: "Neutral",
    definition: "no correlacionada con características protegidas; uso directo permitido.",
  },
  {
    term: "Uso condicional",
    definition:
      "cuando el uso requiere contexto (p. ej. es_estacional con es_prestamo_agropecuario), se especifica en «Uso en modelo».",
  },
];

function isSensitive(row: ProtectedVariable): boolean {
  return row.classification === "Sensible";
}

function modelUseClass(value: string): string {
  return value === "No" ? "font-semibold text-red-600" : "font-medium text-primary-container";
}

const COLUMNS: Column<ProtectedVariable>[] = [
  {
    key: "variable",
    header: "Variable",
    sortable: true,
    sortValue: (row) => row.variable,
    cell: (row) => (
      <span className="whitespace-nowrap">
        <span
          className={`text-sm font-semibold text-slate-900 ${row.monospace ? "font-code-md" : ""}`}
        >
          {row.variable}
        </span>
        {row.hint ? <span className="text-xs text-slate-400"> ({row.hint})</span> : null}
      </span>
    ),
    cellClassName: () => "whitespace-nowrap",
  },
  {
    key: "dataType",
    header: "Tipo de dato",
    sortable: true,
    sortValue: (row) => row.dataType,
    cell: (row) => <span className="text-sm text-slate-600">{row.dataType}</span>,
  },
  {
    key: "classification",
    header: "Clasificación",
    sortable: true,
    sortValue: (row) => row.classification,
    cell: (row) => (
      <span
        className={`inline-flex whitespace-nowrap rounded px-2.5 py-1 text-[11px] font-semibold ${SENSITIVITY_BADGES[row.classification]}`}
      >
        {row.classification}
      </span>
    ),
  },
  {
    key: "modelUse",
    header: "Uso en modelo",
    sortable: true,
    sortValue: (row) => row.modelUse,
    cell: (row) => <span className={modelUseClass(row.modelUse)}>{row.modelUse}</span>,
  },
  {
    key: "auditUse",
    header: "Uso en auditoría",
    sortable: true,
    sortValue: (row) => row.auditUse,
    cell: (row) => <span className="text-sm text-slate-600">{row.auditUse}</span>,
  },
];

/**
 * Sección C: variables protegidas con la leyenda de taxonomía (tooltip `[?]`)
 * y las filas sensibles resaltadas en rojo (HU-04).
 */
export function ProtectedVariables(): JSX.Element {
  const legend = useDisclosure();

  return (
    <SectionCard
      icon="balance"
      title="C. Variables Protegidas y Clasificación Ética"
      badge="10 Variables · HU-04"
      subtitle="Matriz de decisión sobre uso de variables sensibles en modelo vs. auditoría"
      right={
        <div className="relative flex items-center gap-2" ref={legend.containerRef}>
          <button
            type="button"
            aria-expanded={legend.isOpen}
            aria-haspopup="dialog"
            aria-label="Ver leyenda de clasificación de variables"
            onClick={legend.toggle}
            className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-metric-data text-xs text-slate-600 transition-colors hover:bg-slate-50"
          >
            <MaterialIcon name="help" className="text-[14px]!" />
            [?]
          </button>

          {legend.isOpen ? (
            <div
              role="dialog"
              aria-label="Leyenda de clasificación de variables"
              className="absolute top-full right-0 z-30 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-elevation-lg"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Taxonomía de Variables
                </h3>
                <button
                  type="button"
                  aria-label="Cerrar leyenda"
                  onClick={legend.close}
                  className="text-slate-400 transition-colors hover:text-slate-700"
                >
                  <MaterialIcon name="close" className="text-[16px]!" />
                </button>
              </div>
              <ul className="space-y-2.5">
                {TAXONOMY.map((item) => (
                  <li key={item.term} className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800">• {item.term}:</span>{" "}
                    {item.definition}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      }
    >
      <SortableTable
        label="Variables protegidas y su uso en modelo y auditoría"
        rows={PROTECTED_VARIABLES}
        rowKey={(row) => row.variable}
        columns={COLUMNS}
        rowClassName={(row) => (isSensitive(row) ? "bg-red-50/30" : "")}
      />
    </SectionCard>
  );
}
