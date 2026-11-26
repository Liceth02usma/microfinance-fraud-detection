import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setScenario } from "../../src/mocks/scenarios";
import { renderRoute } from "../helpers/renderRoute";

/**
 * La interfaz es para el usuario final: ningún texto visible debe mencionar
 * en qué historia de usuario (HU-xx) se construyó una función.
 */
const HU_PATTERN = /\bHU-?\d+/;

describe("Sin referencias a historias de usuario en la interfaz", () => {
  it.each(["/", "/articulo", "/arquitectura", "/roles", "/simulador", "/valoraciones"])(
    "la ruta %s no muestra HU-xx",
    async (route) => {
      const { container } = renderRoute([route]);
      await screen.findAllByRole("heading");
      expect(container.textContent ?? "").not.toMatch(HU_PATTERN);
    },
  );

  it.each(["rural-legitimo", "urbano-fraudulento", "ambiguo"] as const)(
    "el resultado evaluado (%s) no muestra HU-xx",
    async (scenario) => {
      setScenario(scenario);
      const { container } = renderRoute(["/simulador"]);
      fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));
      await screen.findByRole("region", { name: "Red bayesiana" });
      expect(container.textContent ?? "").not.toMatch(HU_PATTERN);
    },
  );
});
