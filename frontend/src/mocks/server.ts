/**
 * Servidor MSW para pruebas (Vitest). Se registra en `tests/setup.ts` para que
 * toda petición de `apiClient` sea interceptada con los mismos escenarios HU-27
 * que usa el modo desarrollo.
 */

import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);
