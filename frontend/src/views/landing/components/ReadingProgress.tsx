import { MaterialIcon } from "../../../components/MaterialIcon";

export interface ReadingProgressProps {
  /** Porcentaje de lectura (0–100). */
  progress: number;
}

/**
 * Tarjeta de progreso de lectura del visor (índice lateral).
 *
 * El porcentaje se expone también como `aria-valuenow` del progreso para que
 * lectores de pantalla perciban el avance sin depender del color de la barra.
 */
export function ReadingProgress({ progress }: ReadingProgressProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-elevation-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-lg font-bold uppercase tracking-wide text-on-surface">
          Progreso de Lectura
        </span>
        <span className="font-metric-data font-bold text-primary">{progress}%</span>
      </div>

      <div
        role="progressbar"
        aria-label="Progreso de lectura del artículo"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-300"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2 border-t border-outline-variant/30 pt-2">
        <a
          href="/simulador"
          className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded bg-primary px-3 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-brand-light"
        >
          <MaterialIcon name="tune" className="text-[16px]!" />
          Simulador
        </a>
      </div>
    </div>
  );
}
