/** Cliente HTTP hacia el backend FastAPI. La URL base se toma de VITE_API_URL. */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type HealthResponse = { status: string; env: string };

/** Wrapper mínimo de fetch para los endpoints de la API. */
export const apiClient = {
  /** GET /api/v1/health */
  async health(): Promise<HealthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.status}`);
    }
    return res.json() as Promise<HealthResponse>;
  },
};
