import { useCallback, useEffect, useState } from "react";

/**
 * Expone si el desplazamiento vertical supera un umbral en píxeles.
 *
 * Se usa para la barra flotante inferior, que en el diseño original aparece
 * pasado `450px` de desplazamiento. El listener es pasivo y el estado solo se
 * actualiza cuando el booleano resultante cambia (evita re-renders por frame).
 *
 * @param threshold - Umbral en píxeles (por defecto 450).
 */
export function useScrollThreshold(threshold: number): boolean {
  const [past, setPast] = useState(false);

  const evaluate = useCallback(() => {
    setPast((previous) => {
      const next = window.scrollY > threshold;
      return next === previous ? previous : next;
    });
  }, [threshold]);

  useEffect(() => {
    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    return () => window.removeEventListener("scroll", evaluate);
  }, [evaluate]);

  return past;
}
