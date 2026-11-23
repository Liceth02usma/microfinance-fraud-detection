import type { CardItem, NumberedCardItem } from "../../data/types";
import { ToneBadge } from "../ToneBadge";

/** Círculo numerado reutilizado por las tarjetas numeradas y las fases. */
function StepCircle({ index }: { index: string }): JSX.Element {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-metric-data font-bold text-on-primary">
      {index}
    </span>
  );
}

/** Tarjeta destacada de fondo verde suave (Objetivo General). */
export function HighlightCard({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-brand-light/30 bg-brand-soft p-6 shadow-elevation-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-1 font-label-md text-label-md font-semibold text-on-primary">
          {title}
        </span>
      </div>
      <p className="text-body-md font-medium leading-relaxed text-on-surface">{body}</p>
    </div>
  );
}

export interface InfoCardsProps {
  variant: "legal" | "conclusion";
  items: CardItem[];
}

/**
 * Rejilla de tarjetas informativas.
 *
 * - `legal`: marco normativo (borde izquierdo azul auditoría, título azul).
 * - `conclusion`: hallazgos del estudio (título verde + insignia de estado).
 */
export function InfoCards({ variant, items }: InfoCardsProps): JSX.Element {
  const isLegal = variant === "legal";

  return (
    <div className="my-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className={
            isLegal
              ? "flex flex-col rounded-lg border-l-4 border-trust-blue bg-surface p-4 shadow-elevation-sm"
              : "flex flex-col gap-2 rounded-lg border border-outline-variant/40 bg-surface p-5 shadow-elevation-sm"
          }
        >
          {isLegal ? (
            <div className="font-label-lg font-bold text-trust-blue">{item.title}</div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-label-lg font-bold text-primary">{item.title}</span>
              {item.badge ? <ToneBadge text={item.badge.text} tone={item.badge.tone} /> : null}
            </div>
          )}
          <p
            className={`text-body-sm leading-relaxed text-on-surface-variant ${isLegal ? "mt-1" : ""}`}
          >
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Rejilla de tarjetas numeradas con encabezado (Objetivos específicos). */
export function NumberedCards({ items }: { items: NumberedCardItem[] }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.index}
          className="flex flex-col gap-3 rounded-xl border border-slate-300 bg-surface-container-lowest p-5 shadow-elevation-sm"
        >
          <div className="flex items-center gap-2.5">
            <StepCircle index={item.index} />
            <h4 className="font-label-lg font-bold text-primary">{item.title}</h4>
          </div>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Lista vertical de fases metodológicas (título en línea con el cuerpo). */
export function Steps({ items }: { items: NumberedCardItem[] }): JSX.Element {
  return (
    <div className="my-2 flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.index}
          className="flex items-start gap-3 rounded-lg border border-outline-variant/40 bg-surface p-3"
        >
          <StepCircle index={item.index} />
          <div className="text-body-sm leading-relaxed">
            <strong className="font-label-lg text-on-surface">{item.title}</strong> {item.body}
          </div>
        </div>
      ))}
    </div>
  );
}
