import type { CardAccent, StatCardItem } from "../../data/types";

/** Color de la etiqueta según el acento declarado en los datos. */
const ACCENT_CLASSES: Record<CardAccent, string> = {
  secondary: "text-secondary",
  "risk-high": "text-risk-high",
  "risk-medium": "text-risk-medium",
};

export interface StatCardsProps {
  variant: "context" | "issue";
  items: StatCardItem[];
}

/**
 * Tarjetas de métrica.
 *
 * - `context`: tarjeta de contexto territorial (fondo tierra, borde café).
 * - `issue`: fallas del problema, con etiqueta monoespaciada coloreada.
 */
export function StatCards({ variant, items }: StatCardsProps): JSX.Element {
  if (variant === "context") {
    return (
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-3 rounded-lg border-l-4 border-secondary bg-earth-soft p-6 text-earth-dark"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-label-lg font-bold uppercase tracking-wide text-secondary">
                {item.label}
              </span>
              <span className="rounded bg-surface-container-lowest px-2 py-0.5 font-metric-data text-metric-data text-secondary">
                {item.value}
              </span>
            </div>
            <p className="text-body-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="my-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 rounded-lg border border-outline-variant/40 bg-surface p-5"
        >
          <span
            className={`font-metric-data text-metric-data font-bold uppercase ${ACCENT_CLASSES[item.accent ?? "risk-high"]}`}
          >
            {item.label}
          </span>
          <p className="font-headline-md text-headline-md font-bold text-primary">{item.value}</p>
          <p className="text-body-sm text-on-surface-variant">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
