import { useMemo, useState, type ReactNode } from "react";
import { MaterialIcon } from "../MaterialIcon";

export interface Column<T> {
  /** Clave estable de la columna. */
  key: string;
  /** Contenido de la cabecera. */
  header: ReactNode;
  /** Los clics ordenan la tabla por esta columna (contrato 03 §4). */
  sortable?: boolean;
  /** Valor de ordenación; requerido cuando `sortable` es true. */
  sortValue?: (row: T) => string;
  /** Renderizado de la celda. */
  cell: (row: T) => ReactNode;
  /** Clases adicionales de la celda. */
  cellClassName?: (row: T) => string;
}

export interface SortableTableProps<T> {
  /** Columnas de la tabla. */
  columns: Column<T>[];
  /** Filas en orden original. */
  rows: T[];
  /** Clave única de fila. */
  rowKey: (row: T) => string;
  /** Clases adicionales de la fila (p. ej. tinte según clasificación). */
  rowClassName?: (row: T) => string;
  /** Etiqueta accesible del <table> (visiblemente oculta). */
  label: string;
  /** Clase de hover de fila; sustituye al tinte por defecto. */
  hoverClassName?: string;
}

type SortDirection = "ascending" | "descending";

/**
 * Tabla genérica ordenable con accesibilidad de WAI-ARIA:
 * `<th aria-sort>` + botón dentro de la cabecera, foco visible y
 * `overflow-x-auto` para pantallas angostas (contrato 03 §4 y §6).
 *
 * La primera pulsación ordena ascendente, la segunda descendente y la tercera
 * restaura el orden original de los datos.
 */
export function SortableTable<T>({
  columns,
  rows,
  rowKey,
  rowClassName,
  label,
  hoverClassName = "hover:bg-slate-50/70",
}: SortableTableProps<T>): JSX.Element {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return rows;

    const factor = sort.direction === "ascending" ? 1 : -1;
    return [...rows].sort(
      (a, b) => factor * column.sortValue!(a).localeCompare(column.sortValue!(b), "es"),
    );
  }, [columns, rows, sort]);

  const handleSort = (column: Column<T>): void => {
    if (!column.sortable) return;

    setSort((previous) => {
      if (previous?.key !== column.key) return { key: column.key, direction: "ascending" };
      if (previous.direction === "ascending") {
        return { key: column.key, direction: "descending" };
      }
      return null;
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-b-2 border-slate-200 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
            {columns.map((column) => {
              const isActive = sort?.key === column.key;
              const ariaSort = isActive ? sort!.direction : "none";

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? ariaSort : undefined}
                  className="px-5 py-3"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className={`flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-slate-900 ${
                        isActive ? "text-primary-container" : "text-slate-500"
                      }`}
                    >
                      {column.header}
                      <MaterialIcon
                        name={
                          isActive && sort!.direction === "descending"
                            ? "arrow_downward"
                            : isActive
                              ? "arrow_upward"
                              : "unfold_more"
                        }
                        className="text-[12px]!"
                      />
                    </button>
                  ) : (
                    <span className="uppercase tracking-wider">{column.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={rowKey(row)}
              className={`border-b border-slate-100 transition-colors last:border-0 ${hoverClassName} ${
                rowClassName?.(row) ?? ""
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-5 py-4 ${column.cellClassName?.(row) ?? ""}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
