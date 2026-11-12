/**
 * Worker de MSW en el navegador para desarrollo sin backend (T23; HU-25).
 *
 * Solo se activa cuando `VITE_USE_MOCKS=true` (por ejemplo en `.env.local`);
 * en producción la bandera está ausente y todas las peticiones van al
 * backend real sin registrar ningún worker.
 */

import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

/** Lee la bandera `VITE_USE_MOCKS` (solo `"true"` activa los mocks). */
export function mocksEnabled(): boolean {
  const flag = import.meta.env.VITE_USE_MOCKS;
  return typeof flag === "string" && flag.toLowerCase() === "true";
}

/**
 * Registra el service worker de MSW si los mocks están habilitados.
 * Devuelve `true` cuando el worker quedó activo.
 */
export async function startMockWorker(): Promise<boolean> {
  if (!mocksEnabled()) {
    return false;
  }

  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: "bypass" });
  return true;
}
