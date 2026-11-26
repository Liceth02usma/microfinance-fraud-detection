import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiClient } from "../src/api/client";
import type { EvaluationRequest } from "../src/api/types/evaluation.types";
import { getScenario, resetScenario, resolveScenario, setScenario } from "../src/mocks/scenarios";

// Pruebas de la capa de mocking MSW (T23): los mismos handlers que consume
// el modo desarrollo (`VITE_USE_MOCKS=true`) responden aquí vía `setupServer`
// registrado en `tests/setup.ts`. Se ejercitan a través del `apiClient`
// real para verificar el contrato HU-17 completo, incluida la traducción de
// errores 503/422 a mensajes amigables.

/** Solicitudes que respetan el contrato `EvaluationRequest` del OpenAPI. */
function baseRequest(overrides: Partial<EvaluationRequest> = {}): EvaluationRequest {
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
    antiguedad_negocio_meses: 36,
    // 8 señales débiles (caso rural legítimo de HU-27).
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
    // Indicadores fuertes: apagados por defecto.
    cedula_alterada: false,
    ingresos_inconsistentes: false,
    factura_falsa: false,
    referencias_falsas: false,
    historial_adverso: false,
    negocio_inconsistente: false,
    modelo_version: "0.1.0-baseline",
    fuente_datos: "test",
    ...overrides,
  };
}

/** Solicitudes sin señales débiles ni fuertes (caso ambiguo). */
function ambiguousRequest(): EvaluationRequest {
  const request = baseRequest({
    tipo_zona: "urbana",
    oficina: "Oficina Centro",
    sin_historial: false,
    vive_lejos: false,
    sin_local_fijo: false,
    sin_fiador: false,
    cedula_otra_region: false,
    celular_prepago: false,
    sin_cuenta_bancaria: false,
    factura_manual: false,
    ingresos_inconsistentes: true,
  });
  return request;
}

describe("handlers MSW — GET /api/v1/health", () => {
  it("devuelve estado ok con entorno mock", async () => {
    await expect(apiClient.health()).resolves.toEqual({ status: "ok", env: "mock" });
  });
});

describe("handlers MSW — evaluate en modo auto", () => {
  it("solo señales débiles rurales → verde con ≥3 factores y jamás rojo", async () => {
    const response = await apiClient.evaluate(baseRequest());

    expect(response.semaforo).not.toBe("rojo");
    expect(["verde", "amarillo"]).toContain(response.semaforo);
    expect(response.risk_score).toBeLessThan(40);
    expect(response.explanatory_factors.length).toBeGreaterThanOrEqual(3);
    expect(response.activated_rules).toEqual([]);
    expect(response.engine_status?.rules).toBe("ok");
  });

  it("dos indicadores fuertes → rojo con reglas activadas y ≥3 factores", async () => {
    const response = await apiClient.evaluate(
      baseRequest({
        tipo_zona: "urbana",
        cedula_alterada: true,
        factura_falsa: true,
      }),
    );

    expect(response.semaforo).toBe("rojo");
    expect(response.risk_score).toBeGreaterThanOrEqual(80);
    expect(response.activated_rules?.length).toBeGreaterThanOrEqual(1);
    expect(response.explanatory_factors.length).toBeGreaterThanOrEqual(3);
    expect(response.bayesian_probability).toBeGreaterThan(0.5);
  });

  it("sin señales claras → amarillo para revisión manual", async () => {
    const response = await apiClient.evaluate(ambiguousRequest());

    expect(response.semaforo).toBe("amarillo");
    expect(response.explanatory_factors.length).toBeGreaterThanOrEqual(3);
  });

  it("señales débiles fuertes en zona urbana tampoco llegan a rojo (HU-18)", async () => {
    const response = await apiClient.evaluate(
      baseRequest({ tipo_zona: "urbana", oficina: "Oficina Norte" }),
    );

    expect(response.semaforo).not.toBe("rojo");
  });
});

describe("handlers MSW — conmutación de escenarios", () => {
  it("fuerza el escenario rural legítimo aunque la solicitud tenga señales fuertes", async () => {
    setScenario("rural-legitimo");

    const response = await apiClient.evaluate(baseRequest({ cedula_alterada: true }));

    expect(response.semaforo).toBe("verde");
    expect(response.activated_rules).toEqual([]);
    expect(getScenario()).toBe("rural-legitimo");
  });

  it("escenario 503-servicio-cayido lanza ApiError con mensaje amigable", async () => {
    setScenario("503-servicio-cayido");

    const failure = apiClient.evaluate(baseRequest());

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toThrow(/temporalmente no disponible/i);
    try {
      await failure;
    } catch (error) {
      expect((error as ApiError).status).toBe(503);
    }
  });

  it("escenario 422-validacion traduce el detalle de FastAPI a mensaje legible", async () => {
    setScenario("422-validacion");

    const failure = apiClient.evaluate(baseRequest());

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toThrow(/monto_solicitado/i);
    try {
      await failure;
    } catch (error) {
      expect((error as ApiError).status).toBe(422);
    }
  });

  it("resetScenario devuelve al modo auto", async () => {
    setScenario("ambiguo");
    expect(getScenario()).toBe("ambiguo");

    resetScenario();

    expect(getScenario()).toBe("auto");
    const response = await apiClient.evaluate(baseRequest());
    expect(response.semaforo).toBe("verde");
  });
});

describe("resolveScenario (unidad)", () => {
  it("un solo indicador fuerte → ambiguo (amarillo), como en el backend", () => {
    expect(resolveScenario(baseRequest({ historial_adverso: true }))).toBe("ambiguo");
  });

  it("dos o más indicadores fuertes → urbano fraudulento", () => {
    expect(resolveScenario(baseRequest({ historial_adverso: true, factura_falsa: true }))).toBe(
      "urbano-fraudulento",
    );
  });

  it("clasifica como rural legítimo cuando solo hay señales débiles (≥5)", () => {
    expect(resolveScenario(baseRequest())).toBe("rural-legitimo");
  });

  it("clasifica como ambiguo cuando hay pocas señales", () => {
    expect(resolveScenario(ambiguousRequest())).toBe("ambiguo");
  });

  it("una solicitud limpia (sin señales) también queda en amarillo", () => {
    const clean = baseRequest({
      tipo_zona: "urbana",
      oficina: "Oficina Centro",
      sin_historial: false,
      vive_lejos: false,
      sin_local_fijo: false,
      sin_fiador: false,
      cedula_otra_region: false,
      celular_prepago: false,
      sin_cuenta_bancaria: false,
      factura_manual: false,
    });
    expect(resolveScenario(clean)).toBe("ambiguo");
  });

  it("respeta un escenario fijado a mano sin analizar la solicitud", () => {
    setScenario("503-servicio-cayido");
    expect(resolveScenario(ambiguousRequest())).toBe("503-servicio-cayido");
  });
});

describe("startMockWorker (VITE_USE_MOCKS)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("no registra el worker cuando la bandera no está en true", async () => {
    vi.stubEnv("VITE_USE_MOCKS", "false");
    const { startMockWorker } = await import("../src/mocks/browser");

    await expect(startMockWorker()).resolves.toBe(false);
  });

  it("registra el worker cuando VITE_USE_MOCKS=true", async () => {
    vi.stubEnv("VITE_USE_MOCKS", "true");
    const start = vi.fn().mockResolvedValue(undefined);
    vi.doMock("msw/browser", () => ({ setupWorker: vi.fn(() => ({ start })) }));
    vi.resetModules();

    const { startMockWorker } = await import("../src/mocks/browser");

    await expect(startMockWorker()).resolves.toBe(true);
    expect(start).toHaveBeenCalledWith({ onUnhandledRequest: "bypass" });

    vi.doUnmock("msw/browser");
    vi.resetModules();
  });
});
