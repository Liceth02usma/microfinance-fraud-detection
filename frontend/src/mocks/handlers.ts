/**
 * Handlers de MSW tipados contra el contrato OpenAPI real (T23; HU-17, HU-25).
 *
 * Cubren los endpoints planeados en la sección 5 del plan:
 * 1. `POST /api/v1/evaluate` con conmutación de escenarios (ver `scenarios.ts`).
 * 2. `GET  /api/v1/health`   con estado del servicio mockeado.
 *
 * Los patrones usan comodín de origen, de modo que el mismo handler sirve con
 * `VITE_API_URL` apuntando a localhost, 127.0.0.1 o a un host remoto.
 */

import { http, HttpResponse, type RequestHandler } from "msw";

import type { EvaluationRequest } from "../api/types/evaluation.types";
import { SCENARIOS, SERVICIO_CAYIDO_DETAIL, VALIDATION_DETAIL, resolveScenario } from "./scenarios";

/** Cuerpo de `GET /api/v1/health` cuando el servicio está activo. */
export const HEALTH_PAYLOAD = { status: "ok", env: "mock" } as const;

/**
 * Construye el conjunto de handlers. Se llama desde `browser.ts` (worker del
 * navegador) y `server.ts` (interceptación en Vitest), para que ambos entornos
 * compartan exactamente los mismos escenarios.
 */
export function createHandlers(): RequestHandler[] {
  return [
    http.get("*/api/v1/health", () => HttpResponse.json(HEALTH_PAYLOAD)),

    http.post("*/api/v1/evaluate", async ({ request }) => {
      const body = (await request.json()) as EvaluationRequest;
      const scenario = resolveScenario(body);

      if (scenario === "503-servicio-cayido") {
        return HttpResponse.json({ detail: SERVICIO_CAYIDO_DETAIL }, { status: 503 });
      }

      if (scenario === "422-validacion") {
        return HttpResponse.json(VALIDATION_DETAIL, { status: 422 });
      }

      // rural-legitimo | urbano-fraudulento | ambiguo
      return HttpResponse.json(SCENARIOS[scenario]);
    }),
  ];
}

/** Conjunto por defecto usado por `setupServer` y `setupWorker`. */
export const handlers = createHandlers();
