import { footer, footerColumns } from "../data/site";

export interface SiteFooterProps {
  /** Estado del backend (`apiClient.health()`), mostrado como píldora técnica. */
  backendStatus: string;
}

/**
 * Pie de página: descripción institucional, marco regulatorio, gobernanza,
 * canales de contacto y bloque legal con versión y estado del backend.
 */
export function SiteFooter({ backendStatus }: SiteFooterProps): JSX.Element {
  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface-variant">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              {footer.brand}
            </span>
            <p className="font-body-sm leading-relaxed text-on-surface-variant">
              {footer.description}
            </p>
            <p className="font-label-md font-medium text-slate-500">{footer.location}</p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-1">
              <h4 className="mb-1 font-label-lg font-semibold text-on-surface">{column.title}</h4>
              {column.items.map((item) =>
                column.isLink ? (
                  <a
                    key={item}
                    href="#"
                    className="font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item}
                  </a>
                ) : (
                  <span key={item} className="font-body-sm text-body-sm text-on-surface-variant">
                    {item}
                  </span>
                ),
              )}
              {column.title === "Canales Institucionales" ? (
                <span className="mt-2 font-label-md text-slate-500">{footer.hours}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/30 pt-8 sm:flex-row">
          <p className="font-metric-data text-metric-data text-slate-500">{footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-metric-data text-metric-data text-slate-500">
              {footer.version}
            </span>
            <span className="font-metric-data text-metric-data text-slate-500">
              Backend status: {backendStatus}
            </span>
            <span className="rounded bg-brand-soft px-2 py-0.5 font-metric-data text-metric-data font-bold text-risk-low">
              {footer.auditBadge}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
