import { useEffect, useState } from "react";

/**
 * Calcula el porcentaje de lectura (0–100) de un contenedor largo.
 *
 * El visor del artículo mide mucho más que el alto de la ventana, por lo que
 * el progreso se define como la fracción del contenedor que ya ha cruzado el
 * borde superior de la ventana. El cálculo se ejecuta dentro de
 * `requestAnimationFrame` para no acoplar el valor al evento de scroll crudo.
 *
 * @param ref - Referencia al contenedor del visor.
 */
export function useReadingProgress(ref: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = (): void => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrollable = rect.height - viewport;

      if (scrollable <= 0) {
        // Contenedor más corto que la ventana: se considera leído solo cuando
        // su borde superior ya cruzó la parte visible (nada leído al inicio).
        setProgress(rect.top < 0 ? 100 : 0);
        return;
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      setProgress(Math.round((scrolled / scrollable) * 100));
    };

    const schedule = (): void => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref]);

  return progress;
}
