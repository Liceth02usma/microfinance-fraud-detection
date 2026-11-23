import type { ArticleSection } from "../data/types";

export interface SectionIndexProps {
  sections: ArticleSection[];
  /** Ancla de la sección actualmente visible (desplegable del encabezado). */
  activeAnchor: string | null;
}

/**
 * Índice temático lateral del artículo.
 *
 * Cada enlace apunta a `#seccion-N` (el encabezado de la sección) y la sección
 * visible se resalta con `aria-current`, de modo que la navegación sea
 * comprensible también para lectores de pantalla.
 */
export function SectionIndex({ sections, activeAnchor }: SectionIndexProps): JSX.Element {
  return (
    <nav
      aria-label="Índice temático del artículo"
      className="flex flex-col gap-2 rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-elevation-sm"
    >
      <h4 className="mb-2 font-label-lg font-bold uppercase tracking-wider text-on-surface">
        Índice Temático
      </h4>
      <ul className="flex flex-col gap-1 text-body-sm font-medium">
        {sections.map((section) => {
          const isActive = activeAnchor === section.anchor;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-center justify-between gap-2 rounded px-3 py-1.5 transition-colors ${
                  isActive
                    ? "bg-brand-soft font-semibold text-primary"
                    : "text-on-surface-variant hover:bg-brand-soft hover:text-primary"
                }`}
              >
                <span>{section.sidebarLabel}</span>
                <span className="font-metric-data text-label-md text-slate-500">
                  {section.page}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
