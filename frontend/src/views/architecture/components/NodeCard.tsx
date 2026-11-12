import { MaterialIcon } from "../../../components/MaterialIcon";
import type { ArchitectureNode } from "../data/architecture";
import { ZONE_STYLES } from "../zoneStyles";

export interface NodeCardProps {
  node: ArchitectureNode;
  isActive: boolean;
  onSelect: (nodeId: string) => void;
}

/**
 * Tarjeta de nodo del mapa conceptual.
 *
 * Es un `<button>` nativo: obtiene foco, Enter/Espacio y el anillo de foco del
 * sistema sin código adicional (contrato 01 §6: `role="button"` implícito +
 * `aria-label` descriptivo + `aria-pressed` para el estado de selección).
 */
export function NodeCard({ node, isActive, onSelect }: NodeCardProps): JSX.Element {
  const styles = ZONE_STYLES[node.zone];

  const handleSelect = (): void => onSelect(node.id);

  if (node.featured) {
    return (
      <button
        type="button"
        onClick={handleSelect}
        aria-label={`Seleccionar ${node.title}`}
        aria-pressed={isActive}
        className={`node-interactive w-full cursor-pointer rounded-lg border p-4 text-left transition-all duration-200 hover:-translate-y-[3px] hover:shadow-elevation-md ${
          isActive ? styles.active : `border-violet-600/40 bg-violet-50/40 ${styles.hoverBorder}`
        }`}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-base text-white shadow-elevation-sm">
              <MaterialIcon name={node.icon} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{node.title}</h3>
                {node.badge ? (
                  <span className="rounded bg-violet-600 px-2 py-0.5 font-metric-data text-[10px] font-semibold text-white">
                    {node.badge}
                  </span>
                ) : null}
              </div>
              <span className="font-metric-data text-xs text-violet-600">
                Score 0–100 · verde / amarillo / rojo
              </span>
            </div>
          </div>
          {node.engineStatus ? <EngineStatusBadge status={node.engineStatus} /> : null}
        </div>
        <p className="text-xs leading-normal text-slate-600">{node.cardDescription}</p>
        <div className="mt-2 flex items-center justify-between border-t border-violet-600/20 pt-2 text-[11px]">
          <span className={`font-semibold ${styles.footer}`}>{node.footerLeft}</span>
          <span className="font-metric-data text-[10px] text-slate-500">{node.footerRight}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-label={`Seleccionar ${node.title}`}
      aria-pressed={isActive}
      className={`node-interactive relative w-full cursor-pointer rounded-lg border bg-white p-3.5 text-left transition-all duration-200 hover:-translate-y-[3px] hover:shadow-elevation-md ${
        isActive ? styles.active : `border-slate-200 ${styles.hoverBorder}`
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${styles.iconBox}`}
        >
          <MaterialIcon name={node.icon} />
        </span>
        <div className="flex items-center gap-1.5">
          {node.badge ? (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-metric-data text-[10px] font-medium text-slate-600">
              {node.badge}
            </span>
          ) : null}
          {node.engineStatus ? <EngineStatusBadge status={node.engineStatus} /> : null}
        </div>
      </div>
      <h3 className="text-sm font-semibold leading-tight text-slate-900">{node.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-normal text-slate-500">
        {node.cardDescription}
      </p>
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
        <span className={`font-medium ${styles.footer}`}>{node.footerLeft}</span>
        <span className="font-metric-data text-[10px] text-slate-400">{node.footerRight}</span>
      </div>
    </button>
  );
}

function EngineStatusBadge({ status }: { status: "ok" | "missing" }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-metric-data text-[10px] font-medium ${
        status === "ok"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <MaterialIcon name={status === "ok" ? "check_circle" : "warning"} className="text-[9px]!" />
      {status}
    </span>
  );
}
