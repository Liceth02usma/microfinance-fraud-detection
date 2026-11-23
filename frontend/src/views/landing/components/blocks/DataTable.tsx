import type { ArticleTable } from "../../data/types";

/**
 * Severidad de la Tabla B1 (HU-10): las etiquetas de categoría se colorean
 * según su poder confirmatorio, sin depender únicamente del color (el texto
 * "Fuerte"/"Débil" siempre está presente).
 */
const SEVERITY_CLASSES: Record<string, string> = {
  Fuerte: "font-bold text-risk-high",
  Débil: "font-bold text-trust-blue",
};

/** Celdas numéricas o identificadores de regla se muestran monoespaciadas. */
function isMonospaced(value: string): boolean {
  return /^[\d.,%+-]+$/.test(value) || /^R_[FD]\d{2}$/.test(value);
}

export interface DataTableProps {
  table: ArticleTable;
}

/** Tabla científica con encabezado, scroll horizontal y fila destacada. */
export function DataTable({ table }: DataTableProps): JSX.Element {
  const { caption, columns, rows, emphasizeLastRow } = table;

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant/40">
      <table className="w-full text-left text-body-sm">
        {caption ? (
          <caption className="caption-top px-3 pt-3 text-left font-label-md font-bold uppercase tracking-wide text-on-surface">
            {caption}
          </caption>
        ) : null}
        <thead className="bg-surface font-semibold text-on-surface">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="p-3 whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isEmphasized = Boolean(emphasizeLastRow) && rowIndex === rows.length - 1;
            return (
              <tr
                key={rowIndex}
                className={`border-t border-outline-variant/30 ${isEmphasized ? "bg-brand-soft/50 font-medium" : ""}`}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`p-3 align-top ${isMonospaced(cell) ? "font-metric-data" : ""} ${SEVERITY_CLASSES[cell] ?? ""} ${isEmphasized && cellIndex === 0 ? "font-bold text-primary" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
