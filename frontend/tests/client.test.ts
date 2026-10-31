import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../src/api/client";

// Pruebas del cliente HTTP hacia el backend.

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
});
