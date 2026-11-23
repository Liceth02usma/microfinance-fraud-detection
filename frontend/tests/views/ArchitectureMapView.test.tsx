import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderRoute } from "../helpers/renderRoute";

/** Texto del fragmento representativo del inspector (elemento `<pre>`). */
function fragmentText(): string {
  const pre = document.querySelector("pre");
  expect(pre).not.toBeNull();
  return pre?.textContent ?? "";
}

describe("ArchitectureMapView (ruta /arquitectura)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renderiza 9 nodos repartidos en 3 zonas con conectores etiquetados", () => {
    renderRoute(["/arquitectura"]);

    // 9 nodos (contrato 01 §3.1).
    const nodes = screen.getAllByRole("button", { name: /^Seleccionar / });
    expect(nodes).toHaveLength(9);
    for (const node of nodes) {
      expect(node).toHaveAttribute("aria-pressed", "false");
    }

    // 3 zonas (secciones con nombre accesible).
    const zoneSections = screen.getAllByRole("region", { name: /^Zona [ABC] ·/ });
    expect(zoneSections).toHaveLength(3);

    // Conectores con etiqueta visible.
    expect(screen.getByText("Evaluación / Score + Factores")).toBeInTheDocument();
    expect(screen.getByText("Actualización / Auditoría")).toBeInTheDocument();

    // Estado inicial vacío del inspector.
    expect(screen.getByText("Ningún módulo seleccionado")).toBeInTheDocument();
    expect(screen.getByText(/Haz clic en cualquier módulo del diagrama/i)).toBeInTheDocument();
    expect(document.querySelector("pre")).toBeNull();
  });

  it("selecciona un nodo y lo describe en el inspector", () => {
    renderRoute(["/arquitectura"]);

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Motor de Reglas" }));

    // El fragmento YAML solo existe tras seleccionar el nodo.
    expect(fragmentText()).toContain("R-WEAK-SIN-HISTORIAL");
    // «Hot-Reload» vive en la lista de características clave del inspector.
    expect(screen.getByText(/Hot-Reload/)).toBeInTheDocument();
    expect(screen.getByText("ID: nodo-reglas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar Motor de Reglas" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("vuelve al estado vacío al volver a pulsar el mismo nodo", () => {
    renderRoute(["/arquitectura"]);

    const node = screen.getByRole("button", { name: "Seleccionar Motor de Reglas" });
    fireEvent.click(node);
    expect(screen.queryByText("Ningún módulo seleccionado")).toBeNull();

    fireEvent.click(node);
    expect(screen.getByText("Ningún módulo seleccionado")).toBeInTheDocument();
    expect(document.querySelector("pre")).toBeNull();
  });

  it("la salvaguarda rural aparece en el fragmento del motor de reglas", () => {
    renderRoute(["/arquitectura"]);

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Motor de Reglas" }));

    expect(fragmentText()).toContain("tipo_zona != 'rural'");
    expect(fragmentText()).toContain('categoria: "debil"');
  });

  it("la zona ética expone la clasificación de variables protegidas", () => {
    renderRoute(["/arquitectura"]);

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Módulo de Ética y Equidad" }));

    expect(screen.getByText(/Clasificación de Variables Protegidas/)).toBeInTheDocument();
    expect(fragmentText()).toContain("genero");
    expect(fragmentText()).toContain("sensible");
    expect(fragmentText()).toContain("tipo_zona");
  });

  it("«Restablecer Vista» no aparece en esta vista (fila eliminada)", () => {
    renderRoute(["/arquitectura"]);

    expect(screen.queryByRole("button", { name: /Restablecer Vista/i })).toBeNull();
  });

  it("el nodo destacado (Motor Híbrido) muestra el orquestador y su fórmula", () => {
    renderRoute(["/arquitectura"]);

    expect(screen.getByText("ORQUESTADOR")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Motor Híbrido (Fusión)" }));
    expect(fragmentText()).toContain("w_reglas = 0.35");
    expect(fragmentText()).toContain("score ≥ 60");
    expect(screen.getByText("Motor: ok")).toBeInTheDocument();
  });

  it("permite copiar el fragmento del nodo seleccionado", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderRoute(["/arquitectura"]);

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Dataset Sintético" }));
    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("SolicitudSintetica");
    await waitFor(() => expect(screen.getByText("Copiado")).toBeInTheDocument());
  });

  it("no muestra las pestañas de gobierno (fila eliminada)", () => {
    renderRoute(["/arquitectura"]);

    expect(screen.queryByRole("navigation", { name: /Gobierno del Sistema/i })).toBeNull();
  });
});
