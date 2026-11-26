import { fireEvent, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import knowledge from "../../src/mocks/knowledge.fixture.json";
import { server } from "../../src/mocks/server";
import { setScenario } from "../../src/mocks/scenarios";
import { renderRoute } from "../helpers/renderRoute";

describe("Reglas y fusión leídas del backend (GET /knowledge)", () => {
  it("lista las reglas del backend con las activas primero", async () => {
    renderRoute(["/simulador"]);
    const total = knowledge.rules.length;
    expect(await screen.findByText(new RegExp(`de ${total}$`))).toBeInTheDocument();
    expect(screen.getByText(/Vista previa según las señales/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Reglas/i }));

    const toggle = screen.getByRole("button", { name: /reglas inactivas/i });
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /Ocultar reglas inactivas/i })).toBeInTheDocument();
  });

  it("usa los pesos reales en la fórmula tras evaluar", async () => {
    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);
    fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));
    const w = knowledge.fusion.weights;
    const formula = `S = ${w.rules.toFixed(2)}·S_reglas + ${w.bayesian.toFixed(2)}·P_bayes + ${w.ml.toFixed(2)}·P_ml`;
    expect(await screen.findByText(formula)).toBeInTheDocument();
    expect(screen.getByText(/Activadas en la evaluación/i)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`\\[VERSION\\] Modelo ${knowledge.model_version}`)),
    ).toBeInTheDocument();
  });

  it("avisa si la base de conocimiento no está disponible", async () => {
    server.use(
      http.get("*/api/v1/knowledge", () => HttpResponse.json({ detail: "x" }, { status: 503 })),
    );
    renderRoute(["/simulador"]);
    expect(await screen.findByText(/No se pudieron cargar las reglas/i)).toBeInTheDocument();
  });
});
