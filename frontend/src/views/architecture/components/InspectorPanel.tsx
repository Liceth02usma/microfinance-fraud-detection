import { useState } from "react";
import { MaterialIcon } from "../../../components/MaterialIcon";
import type { ArchitectureNode } from "../data/architecture";
import { architectureNodes, zones } from "../data/architecture";
import { ZONE_STYLES } from "../zoneStyles";

export interface InspectorPanelProps {
  /** Nodo seleccionado; `null` muestra el estado vacío (contrato 01 §3.2). */
  node: ArchitectureNode | null;
}

/**
 * Panel inspector lateral (sticky) del mapa de arquitectura.
 *
 * Estado inicial: «Haz clic en cualquier módulo…». Al seleccionar un nodo
 * muestra badge de zona, descripción, características, fragmento representativo
 * con botón de copiar y la referencia del nodo.
 */
export function InspectorPanel({ node }: InspectorPanelProps): JSX.Element {
  return (
    <aside
      aria-label="Panel de inspección contextual"
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-elevation-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <MaterialIcon name="memory" className="text-xs! text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Inspector de Componente
          </span>
        </div>
        <InspectorHeaderBadge node={node} />
      </div>

      {node ? <NodeDetail node={node} /> : <EmptyState />}
    </aside>
  );
}

function InspectorHeaderBadge({ node }: { node: ArchitectureNode | null }): JSX.Element {
  if (!node) {
    return (
      <span className="rounded bg-slate-100 px-2 py-0.5 font-body-sm text-[11px] font-medium text-slate-600">
        Sin selección
      </span>
    );
  }

  const zone = zones.find((item) => item.key === node.zone);
  const styles = ZONE_STYLES[node.zone];

  return (
    <span
      className={`rounded px-2 py-0.5 font-metric-data text-[10px] font-bold uppercase ${styles.badge}`}
    >
      {zone?.letter ?? ""}
    </span>
  );
}

function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <MaterialIcon name="touch_app" className="text-lg!" />
      </span>
      <h4 className="text-sm font-semibold text-slate-800">Ningún módulo seleccionado</h4>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
        Haz clic en cualquier módulo del diagrama para explorar sus especificaciones.
      </p>
      <div className="mt-4 flex w-full flex-col gap-1.5 border-t border-slate-100 pt-4 text-left font-metric-data text-[11px] text-slate-400">
        {zones.map((zone) => {
          const count = architectureNodes.filter((item) => item.zone === zone.key).length;

          return (
            <div key={zone.key} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${ZONE_STYLES[zone.key].legendDot}`} />
              <span>
                {count} módulos en Zona {zone.letter}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NodeDetail({ node }: { node: ArchitectureNode }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const styles = ZONE_STYLES[node.zone];
  const zone = zones.find((item) => item.key === node.zone);

  const handleCopy = (): void => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(node.fragment).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded px-2 py-0.5 font-metric-data text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
          >
            Zona {zone?.letter} · {zone?.shortName}
          </span>
          {node.engineStatus ? (
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-metric-data text-[10px] font-semibold ${
                node.engineStatus === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <MaterialIcon
                name={node.engineStatus === "ok" ? "check_circle" : "warning"}
                className="text-[9px]!"
              />
              Motor: {node.engineStatus}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1.5 text-base font-bold tracking-tight text-slate-900">{node.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{node.description}</p>
      </div>

      <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
          <MaterialIcon name="checklist" className="text-[10px]! text-primary-container" />
          Características Clave
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {node.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <MaterialIcon
                name="check"
                className="mt-0.5 shrink-0 text-[11px]! text-primary-container"
              />
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
            <MaterialIcon name="code" className="text-[10px]! text-slate-500" />
            {node.fragmentLabel}
          </h4>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 font-metric-data text-[10px] text-slate-500 transition-colors hover:text-slate-800"
          >
            <MaterialIcon name={copied ? "check" : "content_copy"} className="text-[12px]!" />
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <pre className="max-h-60 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-3 font-metric-data text-[11px] whitespace-pre text-slate-100">
          {node.fragment}
        </pre>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-metric-data text-[11px] text-slate-400">
        <span>ID: {node.id}</span>
        <span>{node.reference}</span>
      </div>
    </div>
  );
}
