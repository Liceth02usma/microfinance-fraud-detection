import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoute } from "./helpers/renderRoute";

describe("Navegación entre rutas", () => {
  it("llega a /arquitectura desde el menú y marca el enlace activo", () => {
    renderRoute(["/"]);

    fireEvent.click(screen.getByRole("link", { name: "Arquitectura" }));

    expect(
      screen.getByRole("heading", { level: 1, name: /Mapa Interactivo de Arquitectura/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Arquitectura" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // El pie compartido sigue presente y la barra flotante no aparece fuera de /.
    expect(screen.getByText(/Backend status: ok/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Probar Simulador Ahora/i, hidden: true }),
    ).toBeNull();
  });

  it("llega a /roles desde el menú", () => {
    renderRoute(["/"]);

    fireEvent.click(screen.getByRole("link", { name: "Componentes y roles" }));

    expect(
      screen.getByRole("heading", { level: 1, name: /Componentes & Roles/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Componentes y roles" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.queryByRole("link", { name: /Probar Simulador Ahora/i, hidden: true }),
    ).toBeNull();
  });

  it("redirige las rutas desconocidas a la landing", () => {
    renderRoute(["/ruta-que-no-existe"]);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Detección de Fraude en Microcrédito Rural/i,
      }),
    ).toBeInTheDocument();
  });

  it("el enlace de simulador abre la vista de simulador (contrato 02)", () => {
    renderRoute(["/simulador"]);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Simulador de Inferencia Híbrida/i,
      }),
    ).toBeInTheDocument();
  });
});
