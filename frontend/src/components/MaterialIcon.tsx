/**
 * Icono del set Material Symbols (cargado en `index.html`).
 *
 * Los iconos son puramente decorativos: el texto visible siempre comunica la
 * información por sí mismo, por lo que se marcan `aria-hidden` (WCAG 1.1.1).
 */
export interface MaterialIconProps {
  /** Nombre de la ligadura (p. ej. `analytics`, `expand_more`). */
  name: string;
  /** Clases Tailwind adicionales (tamaño, color). */
  className?: string;
}

export function MaterialIcon({ name, className }: MaterialIconProps): JSX.Element {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className ?? ""}`.trim()}>
      {name}
    </span>
  );
}
