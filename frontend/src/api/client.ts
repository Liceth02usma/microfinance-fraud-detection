/**
 * Cliente HTTP tipado hacia el backend FastAPI (HU-17).
 *
 * La URL base se toma de la variable de entorno `VITE_API_URL`.
 * Los tipos provienen del OpenAPI real generado por `npm run generate:types`,
 * de modo que el frontend y el backend comparten el mismo contrato.
 */

import type { EvaluationRequest, EvaluationResponse } from "./types/evaluation.types";

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type HealthResponse = { status: string; env: string };

/** Error de la API con el código HTTP de respuesta. */
export class ApiError extends Error {
  /** Código HTTP devuelto por el backend. */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Convierte el `detail` de FastAPI en un mensaje amigable (fallas de validación, HU-17). */
function friendlyMessage(status: number, fallback: string, payload: unknown): string {
  if (typeof payload !== "object" || payload === null || !("detail" in payload)) {
    return fallback;
  }
  const detail = (payload as { detail: unknown }).detail;
  if (typeof detail === "string") {
    return `${fallback}: ${detail}`;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .filter((item): item is Record<string, unknown> => typeof item === "object")
      .map((item) => {
        const loc = Array.isArray(item.loc) ? item.loc.join(".") : "solicitud";
        const msg = typeof item.msg === "string" ? item.msg : "valor inválido";
        return `${loc}: ${msg}`;
      });
    if (parts.length > 0) {
      return `${fallback} (${status}) — ${parts.join("; ")}`;
    }
  }
  return `${fallback} (${status})`;
}

/** Lee el cuerpo JSON sin lanzar si la respuesta no trae cuerpo. */
async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const apiClient = {
  /** GET /api/v1/health */
  async health(): Promise<HealthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.status}`);
    }
    return res.json() as Promise<HealthResponse>;
  },

  /** POST /api/v1/evaluate — devuelve el contrato unificado de evaluación. */
  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const payload = await readBody(res);
      throw new ApiError(
        res.status,
        friendlyMessage(res.status, "No se pudo evaluar la solicitud", payload),
      );
    }
    return (await readBody(res)) as EvaluationResponse;
  },
};
