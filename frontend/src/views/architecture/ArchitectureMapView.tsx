import { useState } from "react";
import { MaterialIcon } from "../../components/MaterialIcon";
import { InspectorPanel } from "./components/InspectorPanel";
import { ZoneConnector, ZoneSection } from "./components/ZoneSection";
import { architectureNodes, connectors, zones } from "./data/architecture";
import { ZONE_STYLES } from "./zoneStyles";

/**
 * Vista «Mapa Interactivo de Arquitectura» (ruta `/arquitectura`).
 *
 * Réplica de la pantalla «CrediConfianza - Mapa Interactivo de Arquitectura
 * (Tema Claro)» siguiendo el contrato 01: lienzo con tres zonas y nueve nodos
 * a la izquierda (8/12) e inspector sticky a la derecha (4/12).
 *
 * Interacciones: clic en un nodo lo selecciona; clic en el mismo nodo vuelve
 * al estado vacío. El chrome (header/pie) es el compartido de la landing.
 */
export function ArchitectureMapView(): JSX.Element {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const activeNode = architectureNodes.find((node) => node.id === activeNodeId) ?? null;

  const handleSelect = (nodeId: string): void => {
    setActiveNodeId((previous) => (previous === nodeId ? null : nodeId));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Encabezado de la vista + leyenda de zonas */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-elevation-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Mapa Interactivo de Arquitectura
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary-container/20 bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-primary-container">
              <MaterialIcon name="touch_app" className="text-[10px]!" />
              Nodos Interactivos
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Explora visualmente los 9 componentes de la arquitectura híbrida desacoplada, sus flujos
            de datos y responsabilidades ético-analíticas. Selecciona cualquier módulo para
            inspeccionar sus especificaciones técnicas y fórmulas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:gap-3">
          {zones.map((zone) => {
            const styles = ZONE_STYLES[zone.key];

            return (
              <span
                key={zone.key}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium ${styles.legend}`}
              >
                <span className={`h-2 w-2 rounded-full ${styles.legendDot}`} />
                {zone.legendLabel}
              </span>
            );
          })}
        </div>
      </div>

      {/* Mapa (8/12) + inspector (4/12) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <ZoneSection
            zone={zones[0]}
            nodes={architectureNodes.filter((node) => node.zone === zones[0].key)}
            activeNodeId={activeNodeId}
            onSelect={handleSelect}
          />
          <ZoneConnector
            startLabel={connectors[0].startLabel}
            middleLabel={connectors[0].middleLabel}
            fromZone={connectors[0].from}
            toZone={connectors[0].to}
          />
          <ZoneSection
            zone={zones[1]}
            nodes={architectureNodes.filter((node) => node.zone === zones[1].key)}
            activeNodeId={activeNodeId}
            onSelect={handleSelect}
          />
          <ZoneConnector
            startLabel={connectors[1].startLabel}
            middleLabel={connectors[1].middleLabel}
            fromZone={connectors[1].from}
            toZone={connectors[1].to}
            startIcon="arrow_back"
          />
          <ZoneSection
            zone={zones[2]}
            nodes={architectureNodes.filter((node) => node.zone === zones[2].key)}
            activeNodeId={activeNodeId}
            onSelect={handleSelect}
          />
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <InspectorPanel node={activeNode} />
        </div>
      </div>
    </div>
  );
}
