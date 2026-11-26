import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setScenario } from "../../src/mocks/scenarios";
import { renderRoute } from "../helpers/renderRoute";

async function evaluate(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));
  await screen.findByRole("tabpanel", { name: /Razonamiento de los modelos/i });
  await screen.findByRole("region", { name: "Red bayesiana" });
}

describe("Razonamiento de los modelos (HU-20)", () => {
  it("antes de evaluar invita a ejecutar la evaluación", () => {
    renderRoute(["/simulador"]);
    const panel = screen.getByRole("tabpanel", { name: /Razonamiento de los modelos/i });
    expect(within(panel).getByText(/Evalúa la solicitud/i)).toBeInTheDocument();
  });

  it("muestra el razonamiento de reglas, bayes, ML y fusión", async () => {
    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);
    await evaluate();

    const rules = screen.getByRole("region", { name: "Motor de reglas expertas" });
    expect(within(rules).getByText(/topadas a 0.10/i)).toBeInTheDocument();

    const bayes = screen.getByRole("region", { name: "Red bayesiana" });
    expect(within(bayes).getByText("3.29%")).toBeInTheDocument(); // prior
    const observed = within(bayes).getByRole("list", { name: /Evidencia observada/i });
    expect(within(observed).getByText("Celular prepago")).toBeInTheDocument();
    expect(within(observed).getByText("×0.94")).toBeInTheDocument();

    fireEvent.click(within(bayes).getByRole("button", { name: /nodos evaluados/i }));
    expect(within(bayes).getByRole("table")).toBeInTheDocument();
    fireEvent.click(within(bayes).getByRole("button", { name: /Ocultar detalle/i }));
    expect(within(bayes).queryByRole("table")).not.toBeInTheDocument();

    const ml = screen.getByRole("region", { name: /Modelo ML/i });
    const shap = within(ml).getByRole("list", { name: /Contribuciones SHAP/i });
    expect(within(shap).getAllByRole("listitem")).toHaveLength(3);
    expect(within(shap).getAllByText("rural").length).toBeGreaterThan(0);

    const fusion = screen.getByRole("region", { name: /Fusión ponderada/i });
    expect(within(fusion).getByText(/2.8 pts/)).toBeInTheDocument();
  });

  it("sin desglose del backend muestra las salidas agregadas", async () => {
    setScenario("ambiguo");
    renderRoute(["/simulador"]);
    await evaluate();
    expect(screen.getByText(/no envió el desglose por evidencia/i)).toBeInTheDocument();
    expect(screen.getByText(/No hay contribuciones SHAP/i)).toBeInTheDocument();
  });

  it("las pestañas se recorren con las flechas del teclado", async () => {
    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);
    await evaluate();
    const first = screen.getByRole("tab", { name: /Razonamiento/i });
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Factores/i })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tab", { name: /Factores/i }), { key: "ArrowLeft" });
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: /Registrar decisión/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("el resumen plegado lista las señales marcadas", () => {
    renderRoute(["/simulador"]);
    const list = screen.getByRole("list", { name: /Señales débiles marcadas/i });
    expect(within(list).getByText("Sin historial crediticio")).toBeInTheDocument();
    expect(screen.getByText(/Ninguno marcado/i)).toBeInTheDocument();
  });
});
