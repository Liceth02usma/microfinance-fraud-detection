import type { ParityMeterBlock } from "../../data/types";

export interface ParityMeterProps {
  content: ParityMeterBlock;
}

/**
 * Medidor de paridad de falsos positivos rural/urbano (sección 11).
 *
 * Representa la razón FPR sobre una escala lineal cuyo tramo resaltado es la
 * "zona ética óptima" de la regla del 80% (0.80 – 1.25). El valor va siempre
 * acompañado de texto explícito: la barra no comunica por sí sola (WCAG 1.4.1).
 */
export function ParityMeter({ content }: ParityMeterProps): JSX.Element {
  const { value, min, max, lower, upper, verdict, leftLabel, rightLabel, intro } = content;
  const toPercent = (point: number): number => ((point - min) / (max - min)) * 100;

  const zoneStart = toPercent(lower);
  const zoneWidth = toPercent(upper) - zoneStart;
  const fillWidth = Math.min(Math.max(toPercent(value), 0), 100);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-outline-variant/40 bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-label-lg font-bold text-on-surface">{intro}</span>
        <span className="rounded bg-brand-soft px-3 py-1 font-metric-data text-label-md font-bold text-risk-low">
          {verdict}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Razón de falsos positivos rural entre urbano"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${value} dentro de la zona ética ${lower.toFixed(2)} a ${upper.toFixed(2)}`}
        className="relative h-3 w-full overflow-hidden rounded-full bg-slate-300"
      >
        <div
          className="absolute h-full border-x-2 border-brand-light bg-brand-light/30"
          style={{ left: `${zoneStart}%`, width: `${zoneWidth}%` }}
        />
        <div className="h-full rounded-full bg-primary" style={{ width: `${fillWidth}%` }} />
      </div>

      <div className="flex flex-wrap justify-between gap-2 text-center font-metric-data text-metric-data text-slate-500">
        <span>{leftLabel}</span>
        <span className="font-bold text-primary">
          Zona Ética Óptima ({lower.toFixed(2)} - {upper.toFixed(2)})
        </span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
