import { useEffect, useState } from "react";

/**
 * Resalta el enlace de navegación correspondiente a la sección visible.
 *
 * Recorre los identificadores pasados y devuelve el de la sección cuyo rango
 * vertical cruza la línea de referencia situada justo bajo el encabezado fijo
 * (80px de alto + margen). Se recalcula con `requestAnimationFrame` para no
 * acoplar el estado al evento de scroll crudo.
 *
 * @param ids - Identificadores a observar (pasar un arreglo estable, p. ej. de nivel módulo).
 * @param offset - Píxeles bajo el borde inferior del encabezado (por defecto 100).
 */
export function useActiveSection(ids: string[], offset = 100): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const evaluate = (): void => {
      let next: string | null = null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) {
          next = id;
          break;
        }
      }
      setActiveId((previous) => (previous === next ? previous : next));
    };

    const schedule = (): void => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        evaluate();
      });
    };

    evaluate();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids, offset]);

  return activeId;
}
