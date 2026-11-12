import { render, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../src/App";

/**
 * Monta las rutas de la aplicación dentro de un `MemoryRouter` (aislado del
 * historial del navegador) con el pie indicando `Backend status: ok`.
 */
export function renderRoute(initialEntries: string[] = ["/"]): RenderResult {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppRoutes backendStatus="ok" />
    </MemoryRouter>,
  );
}
