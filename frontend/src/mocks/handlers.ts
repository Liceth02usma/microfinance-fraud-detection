/**
 * Handlers de MSW tipados contra el contrato OpenAPI real (T23; HU-17, HU-25).
 *
 * Cubren:
 * 1. `POST /api/v1/evaluate` con conmutación de escenarios (ver `scenarios.ts`).
 * 2. `GET  /api/v1/health`   con estado del servicio mockeado.
 * 3. `GET  /api/v1/knowledge` con la respuesta real del backend guardada en
 *    `knowledge.fixture.json` (regenerarla si cambian reglas o fusión).
 * 4. `/api/v1/valuations` con un almacén en memoria (solo modo mocks/pruebas).
 *
 * Los patrones usan comodín de origen, de modo que el mismo handler sirve con
 * `VITE_API_URL` apuntando a localhost, 127.0.0.1 o a un host remoto.
 */

import { http, HttpResponse, type RequestHandler } from "msw";

import type {
  EvaluationRequest,
  KnowledgeResponse,
  ValuationCreate,
  ValuationRecord,
} from "../api/types/evaluation.types";
import knowledgeFixture from "./knowledge.fixture.json";
import { SCENARIOS, SERVICIO_CAYIDO_DETAIL, VALIDATION_DETAIL, resolveScenario } from "./scenarios";

const SUGGESTED: Record<string, ValuationRecord["decision"]> = {
  verde: "aprobar",
  amarillo: "revision_comite",
  rojo: "rechazar",
};

/** Almacén en memoria de valoraciones para el modo mocks y las pruebas. */
const valuationStore: ValuationRecord[] = [];

/** Vacía el almacén de valoraciones simuladas (pruebas). */
export function resetValuationStore(): void {
  valuationStore.length = 0;
}

function toSummary(record: ValuationRecord) {
  const {
    id,
    created_at,
    cliente_nombre,
    cliente_documento,
    analista,
    tipo_zona,
    monto_solicitado,
    risk_score,
    semaforo,
    decision,
    sigue_recomendacion,
  } = record;
  return {
    id,
    created_at,
    cliente_nombre,
    cliente_documento,
    analista,
    tipo_zona,
    monto_solicitado,
    risk_score,
    semaforo,
    decision,
    sigue_recomendacion,
  };
}

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

    http.get("*/api/v1/knowledge", () => HttpResponse.json(knowledgeFixture as KnowledgeResponse)),

    http.post("*/api/v1/valuations", async ({ request }) => {
      const body = (await request.json()) as ValuationCreate;
      const scenario = resolveScenario(body.solicitud);
      const resultado =
        scenario in SCENARIOS ? SCENARIOS[scenario as keyof typeof SCENARIOS] : null;
      if (!resultado) {
        return HttpResponse.json({ detail: SERVICIO_CAYIDO_DETAIL }, { status: 503 });
      }
      const record: ValuationRecord = {
        id: valuationStore.length + 1,
        created_at: new Date().toISOString(),
        cliente_nombre: body.cliente_nombre,
        cliente_documento: body.cliente_documento,
        analista: body.analista,
        tipo_zona: body.solicitud.tipo_zona,
        monto_solicitado: body.solicitud.monto_solicitado,
        risk_score: resultado.risk_score,
        semaforo: resultado.semaforo,
        decision: body.decision,
        sigue_recomendacion: SUGGESTED[resultado.semaforo] === body.decision,
        motivo: body.motivo,
        observaciones: body.observaciones ?? null,
        solicitud: body.solicitud,
        resultado,
        version_sistema: `ml=${knowledgeFixture.model_version}|mock`,
      };
      valuationStore.push(record);
      return HttpResponse.json(record, { status: 201 });
    }),

    http.get("*/api/v1/valuations", ({ request }) => {
      const q = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? "";
      const items = [...valuationStore]
        .reverse()
        .filter(
          (r) =>
            !q ||
            r.cliente_nombre.toLowerCase().includes(q) ||
            r.cliente_documento.toLowerCase().includes(q) ||
            r.analista.toLowerCase().includes(q),
        )
        .map(toSummary);
      return HttpResponse.json({ total: items.length, items });
    }),

    http.get("*/api/v1/valuations/:id", ({ params }) => {
      const record = valuationStore.find((r) => String(r.id) === String(params.id));
      return record
        ? HttpResponse.json(record)
        : HttpResponse.json({ detail: "La valoración no existe." }, { status: 404 });
    }),
  ];
}

/** Conjunto por defecto usado por `setupServer` y `setupWorker`. */
export const handlers = createHandlers();
