import type { BadgeTone } from "../data/types";

/** Mapa de tono → clases semánticas de la insignia. */
const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-primary",
  "risk-low": "bg-brand-soft text-risk-low",
  bias: "bg-brand-soft text-bias-warning",
  trust: "bg-surface-container-low text-trust-blue",
  muted: "bg-surface-container-low text-on-surface-variant",
};

export interface ToneBadgeProps {
  text: string;
  tone: BadgeTone;
}

/** Insignia compacta (monoespaciada) usada en las tarjetas del artículo. */
export function ToneBadge({ text, tone }: ToneBadgeProps): JSX.Element {
  return (
    <span
      className={`shrink-0 rounded px-2 py-0.5 font-metric-data text-label-md font-bold ${TONE_CLASSES[tone]}`}
    >
      {text}
    </span>
  );
}
