import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderRoute } from "../helpers/renderRoute";

/** Cuentas de fila exigidas por el contrato 03 §5 (sin la fila de cabecera). */
function rowCount(tableIndex: number): number {
  const tables = screen.getAllByRole("table");
  return within(tables[tableIndex]).getAllByRole("row").length - 1;
}

describe("ComponentsRolesView (ruta /roles)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("renderiza las 4 secciones con los conteos del contrato (9/13/6/10/6)", () => {
    renderRoute(["/roles"]);

    expect(
      screen.getByRole("heading", { level: 1, name: /Componentes & Roles/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /A\. Matriz de Componentes/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /B\. Señales de Fraude/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /C\. Variables Protegidas/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /D\. Roles Humanos/ }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("table")).toHaveLength(5);
    expect(rowCount(0)).toBe(9); // matriz de componentes
    expect(rowCount(1)).toBe(13); // señales débiles
    expect(rowCount(2)).toBe(6); // indicadores fuertes
    expect(rowCount(3)).toBe(10); // variables protegidas
    expect(rowCount(4)).toBe(6); // roles humanos
  });

  it("incluye la salvaguarda HU-18 sobre las señales débiles", () => {
    renderRoute(["/roles"]);

    expect(screen.getByText(/Salvaguarda Ética \(HU-18\)/)).toBeInTheDocument();
    expect(screen.getByText(/techo acumulativo de 0\.10/)).toBeInTheDocument();
    expect(screen.getByText(/nunca rechazo automático/i)).toBeInTheDocument();
  });

  it("clasifica genero como Sensible y sin uso en el modelo", () => {
    renderRoute(["/roles"]);

    const variablesTable = screen.getAllByRole("table")[3];
    const row = within(variablesTable)
      .getAllByRole("row")
      .find((candidate) => within(candidate).queryByText("genero") !== null);

    expect(row).toBeDefined();
    expect(within(row as HTMLElement).getByText("Sensible")).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("No")).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText(/FPR por género/)).toBeInTheDocument();
  });

  it("incluye la nota de trazabilidad HU-26 (W3C PROV-O)", () => {
    renderRoute(["/roles"]);

    expect(screen.getByText(/Trazabilidad Obligatoria \(W3C PROV-O\)/)).toBeInTheDocument();
    expect(screen.getByText(/wasGeneratedBy/)).toBeInTheDocument();
  });

  it("ordena las tablas al pulsar una cabecera ordenable", () => {
    renderRoute(["/roles"]);

    const matrix = screen.getAllByRole("table")[0];
    const layerHeader = within(matrix).getByRole("columnheader", { name: /Capa/ });
    expect(layerHeader).toHaveAttribute("aria-sort", "none");

    const firstComponent = (): string => within(matrix).getAllByRole("row")[1].textContent ?? "";

    const originalFirst = firstComponent();
    fireEvent.click(within(layerHeader).getByRole("button"));

    expect(layerHeader).toHaveAttribute("aria-sort", "ascending");
    expect(firstComponent()).not.toBe(originalFirst);

    fireEvent.click(within(layerHeader).getByRole("button"));
    expect(layerHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("abre y cierra la leyenda de taxonomía con el botón [?]", () => {
    renderRoute(["/roles"]);

    const trigger = screen.getByRole("button", { name: /Ver leyenda de clasificación/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("dialog", { name: /Leyenda de clasificación de variables/i }),
    ).toBeNull();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("dialog", { name: /Leyenda de clasificación de variables/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/variable protegida directa/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar leyenda" }));
    expect(
      screen.queryByRole("dialog", { name: /Leyenda de clasificación de variables/i }),
    ).toBeNull();
  });

  it("despliega el checklist de conformidad HU-26 y lo descarta", () => {
    renderRoute(["/roles"]);

    const toggle = screen.getByRole("button", { name: /Verificar Conformidad HU-26/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/9\/9 Componentes del sistema auditados/)).toBeNull();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/9\/9 Componentes del sistema auditados/)).toBeInTheDocument();
    expect(screen.getByText(/Salvaguarda ética HU-18: Activa/)).toBeInTheDocument();
    expect(screen.getByText(/Firma digital del auditor/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
    expect(screen.queryByText(/9\/9 Componentes del sistema auditados/)).toBeNull();
  });

  it("permite generar la ficha técnica por impresión", () => {
    const print = vi.fn();
    Object.defineProperty(window, "print", { value: print, configurable: true });

    renderRoute(["/roles"]);

    fireEvent.click(screen.getByRole("button", { name: /Ficha Técnica PDF/i }));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it("las tablas admiten desplazamiento horizontal en pantallas angostas", () => {
    renderRoute(["/roles"]);

    const scrollable = document.querySelectorAll(".overflow-x-auto");
    expect(scrollable.length).toBeGreaterThanOrEqual(5);
  });
});
