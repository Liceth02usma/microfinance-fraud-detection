import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiClient } from "../src/api/client";
import type { EvaluationRequest, EvaluationResponse } from "../src/api/types/evaluation.types";

// Pruebas del cliente HTTP tipado hacia el backend (HU-17).

/** Payload válido que respeta el contrato EvaluationRequest del OpenAPI real. */
function validRequest(): EvaluationRequest {
  return {
    id_solicitud: "SOL-0001-000001",
    tipo_zona: "rural",
    oficina: "Corregimiento El Porvenir",
    genero: "femenino",
    pertenencia_etnica: "campesino",
    producto_credito: "agropecuario",
    tipo_negocio: "parcela_finca",
    monto_solicitado: 8_000_000,
    plazo_meses: 24,
    ingresos_declarados: 4_000_000,
    edad_solicitante: 45,
    es_estacional: true,
    sin_historial: true,
    vive_lejos: true,
    sin_local_fijo: true,
    sin_fiador: true,
    cedula_otra_region: true,
    celular_prepago: true,
    sin_cuenta_bancaria: true,
    factura_manual: true,
    fotos_poco_convincentes: false,
    sin_referencias_comerciales: false,
    nombre_distinto_recibo: false,
    negocio_pequeno_monto: false,
    direccion_sin_georreferenciar: false,
    cedula_alterada: false,
    ingresos_inconsistentes: false,
    factura_falsa: false,
    referencias_falsas: false,
    historial_adverso: false,
    negocio_inconsistente: false,
    modelo_version: "0.1.0-baseline",
    fuente_datos: "test",
  };
}

/** Respuesta válida del contrato EvaluationResponse. */
function validResponse(): EvaluationResponse {
  return {
    risk_score: 12,
    semaforo: "verde",
    activated_rules: [],
    bayesian_probability: 0.08,
    ml_probability: 0.05,
    explanatory_factors: [
      "Caso rural con 8 señales débiles: no implica fraude (HU-18).",
      "Sin indicadores fuertes de fraude detectados.",
      "El sistema recomienda; la decisión final es del analista (HU-09).",
    ],
    model_version: "0.1.0-baseline",
    engine_status: { rules: "ok", bayesian: "ok", ml: "ok" },
  };
}

function mockFetch(response: {
  ok: boolean;
  status: number;
  jsonBody?: unknown;
}): ReturnType<typeof vi.fn> {
  const jsonMock = vi.fn().mockResolvedValue(response.jsonBody ?? null);
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: jsonMock,
  }) as unknown as typeof fetch;
  return jsonMock;
}

describe("apiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("health devuelve el cuerpo cuando la respuesta es ok", async () => {
    const jsonMock = vi.fn().mockResolvedValue({ status: "ok", env: "test" });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jsonMock,
    }) as unknown as typeof fetch;

    const result = await apiClient.health();
    expect(result).toEqual({ status: "ok", env: "test" });
    expect(jsonMock).toHaveBeenCalledOnce();
  });

  it("health lanza error cuando la respuesta no es ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn(),
    }) as unknown as typeof fetch;

    await expect(apiClient.health()).rejects.toThrow("Health check failed: 503");
  });

  it("evaluate envía POST a /api/v1/evaluate con el payload del contrato", async () => {
    const jsonMock = mockFetch({ ok: true, status: 200, jsonBody: validResponse() });
    const request = validRequest();

    const result = await apiClient.evaluate(request);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("/api/v1/evaluate");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual(request);
    expect(jsonMock).toHaveBeenCalledOnce();

    expect(result.semaforo).toBe("verde");
    expect(result.risk_score).toBeGreaterThanOrEqual(0);
    expect(result.explanatory_factors.length).toBeGreaterThanOrEqual(3);
  });

  it("evaluate devuelve la respuesta tipada del backend", async () => {
    const expected = validResponse();
    mockFetch({ ok: true, status: 200, jsonBody: expected });

    const result: EvaluationResponse = await apiClient.evaluate(validRequest());

    expect(result).toEqual(expected);
    expect(["verde", "amarillo", "rojo"]).toContain(result.semaforo);
    expect(result.engine_status?.rules).toBe("ok");
  });

  it("evaluate traduce un 422 de validación en un mensaje legible", async () => {
    mockFetch({
      ok: false,
      status: 422,
      jsonBody: {
        detail: [
          { loc: ["body", "monto_solicitado"], msg: "Input should be greater than 1000000" },
        ],
      },
    });

    const failure = apiClient.evaluate(validRequest());

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toThrow(/monto_solicitado.*(greater|mayor)/i);
  });

  it("evaluate propaga el código HTTP en ApiError", async () => {
    mockFetch({ ok: false, status: 500, jsonBody: { detail: "fallo interno" } });

    try {
      await apiClient.evaluate(validRequest());
      expect.unreachable("evaluate debía lanzar ApiError");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).message).toContain("fallo interno");
    }
  });

  it("evaluate usa un mensaje genérico cuando el cuerpo no trae detail", async () => {
    mockFetch({ ok: false, status: 500, jsonBody: { mensaje: "sin detalle" } });

    await expect(apiClient.evaluate(validRequest())).rejects.toThrow(
      "No se pudo evaluar la solicitud",
    );
  });

  it("evaluate cae al mensaje con código cuando detail no tiene forma utilizable", async () => {
    mockFetch({ ok: false, status: 502, jsonBody: { detail: 42 } });
    await expect(apiClient.evaluate(validRequest())).rejects.toThrow(
      "No se pudo evaluar la solicitud (502)",
    );

    // Array con elementos que no son objetos: se descartan y queda el mensaje genérico.
    mockFetch({ ok: false, status: 502, jsonBody: { detail: ["sin forma"] } });
    await expect(apiClient.evaluate(validRequest())).rejects.toThrow(
      "No se pudo evaluar la solicitud (502)",
    );
  });

  it("evaluate completa el detalle cuando un ítem no trae loc ni msg", async () => {
    mockFetch({ ok: false, status: 422, jsonBody: { detail: [{}] } });

    await expect(apiClient.evaluate(validRequest())).rejects.toThrow(
      /No se pudo evaluar la solicitud \(422\).*solicitud.*valor inválido/i,
    );
  });

  it("evaluate tolera cuerpos no legibles y sigue fallando con mensaje claro", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("cuerpo no JSON")),
    }) as unknown as typeof fetch;

    await expect(apiClient.evaluate(validRequest())).rejects.toThrow(
      "No se pudo evaluar la solicitud",
    );
  });
});
