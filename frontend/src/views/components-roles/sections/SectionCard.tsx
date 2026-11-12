import type { ReactNode } from "react";
import { MaterialIcon } from "../../../components/MaterialIcon";

export interface SectionCardProps {
  /** Ligadura del icono Material Symbols del encabezado. */
  icon: string;
  title: string;
  /** Pastilla técnica junto al título (p. ej. «9 Componentes · 3 Capas»). */
  badge?: string;
  subtitle?: string;
  /** Contenido a la derecha del encabezado (leyendas, píldoras, botones). */
  right?: ReactNode;
  children: ReactNode;
}

/**
 * Tarjeta de sección con encabezado (icono + título + pastilla + subtítulo),
 * replicando el encabezado de sección del diseño «Componentes & Roles».
 */
export function SectionCard({
  icon,
  title,
  badge,
  subtitle,
  right,
  children,
}: SectionCardProps): JSX.Element {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-elevation-sm">
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-slate-50/30 px-6 py-5 lg:px-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-white shadow-elevation-sm">
          <MaterialIcon name={icon} className="text-[22px]!" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {badge ? (
              <span className="rounded bg-primary-fixed/60 px-2.5 py-1 font-metric-data text-xs text-primary-container">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
