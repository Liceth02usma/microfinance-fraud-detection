import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { resetValuationStore } from "../src/mocks/handlers";
import { server } from "../src/mocks/server";
import { resetKnowledgeCache } from "../src/hooks/useKnowledge";
import { resetScenario } from "../src/mocks/scenarios";

// Intercepta TODA petición de red con los escenarios de `src/mocks/`
// (T23): las pruebas usan los mismos casos de referencia HU-27 que el
// modo desarrollo con `VITE_USE_MOCKS=true`.
// jsdom no implementa el desplazamiento; AppLayout lo usa al cambiar de ruta.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  // Restaura handlers y vuelve al escenario automático entre pruebas.
  server.resetHandlers();
  resetScenario();
  resetValuationStore();
  resetKnowledgeCache();
});

afterAll(() => {
  server.close();
});
