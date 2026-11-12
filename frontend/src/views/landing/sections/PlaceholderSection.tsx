import { MaterialIcon } from "../components/MaterialIcon";
import type { PlaceholderSection as PlaceholderData } from "../data/site";

export interface PlaceholderSectionProps {
  section: PlaceholderData;
}

/**
 * Sección reservada del diseño original.
 *
 * En la pantalla de Stitch las secciones de arquitectura, simulador y roles
 * existen como anclas sin contenido; aquí se renderiza una tarjeta informativa
 * para que la navegación no apunte a destinos inexistentes.
 */
export function PlaceholderSection({ section }: PlaceholderSectionProps): JSX.Element {
  return (
    <section id={section.id} className="w-full bg-surface py-16 lg:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center lg:px-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-primary">
          <MaterialIcon name={section.icon} className="text-[24px]!" />
        </span>
        <h2 className="font-headline-md text-headline-md font-semibold text-primary">
          {section.title}
        </h2>
        <p className="max-w-2xl text-body-md leading-relaxed text-on-surface-variant">
          {section.description}
        </p>
        <span className="rounded bg-surface-container-low px-3 py-1 font-label-md uppercase tracking-wide text-slate-500">
          Sección en preparación
        </span>
      </div>
    </section>
  );
}
