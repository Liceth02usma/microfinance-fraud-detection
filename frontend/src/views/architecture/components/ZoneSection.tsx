import { MaterialIcon } from "../../../components/MaterialIcon";
import type { ArchitectureNode, ZoneDefinition } from "../data/architecture";
import { ZONE_STYLES } from "../zoneStyles";
import { NodeCard } from "./NodeCard";

export interface ZoneSectionProps {
  zone: ZoneDefinition;
  nodes: ArchitectureNode[];
  activeNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

/**
 * Contenedor de una zona del mapa (borde, banner y grilla de nodos).
 *
 * La zona B renderiza el nodo destacado (Motor Híbrido) a ancho completo y el
 * resto de los motores en tres columnas, como en el diseño original.
 */
export function ZoneSection({
  zone,
  nodes,
  activeNodeId,
  onSelect,
}: ZoneSectionProps): JSX.Element {
  const styles = ZONE_STYLES[zone.key];
  const featured = nodes.filter((node) => node.featured);
  const regular = nodes.filter((node) => !node.featured);

  return (
    <section
      aria-label={zone.title}
      className={`relative overflow-hidden rounded-xl border-2 bg-white p-4 shadow-elevation-sm ${styles.border}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${styles.badge}`}
          >
            {zone.letter}
          </span>
          <h2 className={`text-xs font-bold uppercase tracking-wider ${styles.title}`}>
            {zone.title}
          </h2>
        </div>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-metric-data text-[11px] text-slate-500">
          {zone.meta}
        </span>
      </div>

      {featured.length > 0 ? (
        <div className="mb-3.5">
          {featured.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isActive={activeNodeId === node.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}

      <div
        className={`grid grid-cols-1 gap-3 ${
          regular.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {regular.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            isActive={activeNodeId === node.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export interface ZoneConnectorProps {
  startLabel: string;
  middleLabel: string;
  fromZone: ZoneDefinition["key"];
  toZone: ZoneDefinition["key"];
  /** Icono de la flecha de ida (diseño: `arrow_downward`, o `arrow_back`). */
  startIcon?: string;
}

/** Pastilla con flechas que enlaza dos zonas del mapa (etiqueta obligatoria). */
export function ZoneConnector({
  startLabel,
  middleLabel,
  fromZone,
  toZone,
  startIcon = "arrow_downward",
}: ZoneConnectorProps): JSX.Element {
  const fromStyles = ZONE_STYLES[fromZone];
  const toStyles = ZONE_STYLES[toZone];

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 font-metric-data text-xs text-slate-600 shadow-elevation-sm">
        <span className={`font-semibold ${fromStyles.title}`}>{startLabel}</span>
        <MaterialIcon name={startIcon} className="text-[11px]! text-slate-400" />
        <span>{middleLabel}</span>
        <MaterialIcon name="arrow_upward" className={`text-[11px]! ${toStyles.title}`} />
      </div>
    </div>
  );
}
