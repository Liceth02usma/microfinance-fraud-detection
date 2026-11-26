import { Link } from "react-router-dom";
import { stickyBar } from "../data/site";
import { useScrollThreshold } from "../hooks/useScrollThreshold";

/**
 * Barra flotante inferior con el resumen del sistema y el acceso al simulador.
 *
 * Se oculta tras `translate-y-full` (como en el diseño original) y se marca
 * `aria-hidden` mientras no sea visible para que no anuncie contenido inútil.
 */
export function StickyCtaBar(): JSX.Element {
  const isVisible = useScrollThreshold(stickyBar.scrollThreshold);

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed bottom-0 left-0 z-40 w-full bg-surface-container-lowest/95 px-6 py-3 shadow-sticky backdrop-blur-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-light" aria-hidden="true" />
          <span className="font-label-lg font-semibold text-primary">{stickyBar.title}</span>
          <span className="hidden font-body-sm text-body-sm text-on-surface-variant md:inline">
            {stickyBar.subtitle}
          </span>
        </div>
        <Link
          to={stickyBar.ctaHref}
          tabIndex={isVisible ? undefined : -1}
          className="inline-flex min-h-[44px] items-center justify-center rounded bg-primary-container px-5 font-label-lg text-label-lg text-on-primary transition-colors hover:bg-brand-light"
        >
          {stickyBar.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
