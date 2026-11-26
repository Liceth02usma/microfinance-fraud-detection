import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { setScenario } from "../../src/mocks/scenarios";
import { renderRoute } from "../helpers/renderRoute";

/** Despliega un bloque plegable del formulario por su título. */
function expand(title: RegExp): void {
  fireEvent.click(screen.getByRole("button", { name: title }));
}

// MSW intercepta todos los fetch; los escenarios se controlan con setScenario.
// afterEach de setup.ts ya llama resetScenario() y server.resetHandlers().

describe("SimuladorPage (ruta /simulador)", () => {
  it("renderiza el encabezado, selector de zona, casos testigo y botones de acción", () => {
    renderRoute(["/simulador"]);

    expect(
      screen.getByText("Simulador de Inferencia Híbrida y Auditoría Ética"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Urbano comercial" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rural agropecuario" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Evaluar solicitud/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Limpiar todos los campos/i)).toBeInTheDocument();
    // Estado inicial: sin evaluación pendiente
    expect(screen.getAllByText(/Esperando señales/i).length).toBeGreaterThan(0);
  });

  it("fmt: el slider de monto muestra el valor formateado en COP al renderizar", () => {
    renderRoute(["/simulador"]);
    // DEFAULT_FORM.monto = 8_500_000
    expect(screen.getByText(/\$ 8\.500\.000 COP/)).toBeInTheDocument();
  });

  it("Evaluar: llama al backend y muestra resultado verde con motores y factores", async () => {
    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);

    fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Riesgo bajo" })).toBeInTheDocument();
    });
    expect(screen.getByText("Desglose de motores híbridos")).toBeInTheDocument();
    expect(screen.getByText("Factores explicativos del dictamen")).toBeInTheDocument();
    // Terminal muestra la traza
    expect(screen.getByText(/\[VEREDICTO\]/)).toBeInTheDocument();
  });

  it("Limpiar: desmarca todos los checkboxes y limpia el resultado", () => {
    renderRoute(["/simulador"]);

    expand(/Señales débiles/i);
    expand(/Perfil y crédito/i);
    // DEFAULT_FORM tiene sin_historial = true
    const sinHistorial = screen.getByRole("checkbox", { name: /Sin historial crediticio/i });
    expect(sinHistorial).toBeChecked();

    fireEvent.click(screen.getByTitle(/Limpiar todos los campos/i));

    expect(sinHistorial).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Ciclos de amortización/i })).not.toBeChecked();
    // Terminal vuelve al estado idle
    expect(screen.getAllByText(/Esperando señales/i).length).toBeGreaterThan(0);
  });

  it("handleZona: alterna entre economía urbana y rural", () => {
    renderRoute(["/simulador"]);

    expect(screen.getByText(/Economía campesina/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Urbano comercial" }));
    expect(screen.getByText(/Economía urbana/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rural agropecuario" }));
    expect(screen.getByText(/Economía campesina/)).toBeInTheDocument();
  });

  it("handleField: cambiar el select de género actualiza el formulario", () => {
    renderRoute(["/simulador"]);

    const select = screen.getByDisplayValue("Femenino (Mujer Rural)");
    fireEvent.change(select, { target: { value: "masculino" } });
    expect(screen.getByDisplayValue("Masculino")).toBeInTheDocument();
  });

  it("handleWeak: marcar/desmarcar una señal débil cambia su estado", () => {
    renderRoute(["/simulador"]);
    expand(/Señales débiles/i);

    const cb = screen.getByRole("checkbox", { name: /Sin historial crediticio/i });
    const initial = (cb as HTMLInputElement).checked;
    fireEvent.click(cb);
    expect((cb as HTMLInputElement).checked).toBe(!initial);
    fireEvent.click(cb);
    expect((cb as HTMLInputElement).checked).toBe(initial);
  });

  it("handleStrong: activar un indicador fuerte lo marca y actualiza la salvaguarda", () => {
    renderRoute(["/simulador"]);
    expand(/Indicios fuertes/i);

    const cb = screen.getByRole("checkbox", { name: /Cédula alterada/i });
    expect(cb).not.toBeChecked();
    fireEvent.click(cb);
    expect(cb).toBeChecked();
    // Con un fuerte activo, la salvaguarda cambia a "Alerta objetiva"
    expect(screen.getByText("Alerta objetiva")).toBeInTheDocument();
  });

  it("handleCargarCaso 'urbano_fraude': carga preset y obtiene veredicto rojo", async () => {
    setScenario("urbano-fraudulento");
    renderRoute(["/simulador"]);

    fireEvent.click(screen.getByRole("button", { name: /Urbano fraude/i }));

    await waitFor(() => {
      expect(screen.getByText("Alerta alta de fraude")).toBeInTheDocument();
    });
  });

  it("handleCargarCaso 'ambiguo': carga preset y obtiene veredicto amarillo", async () => {
    setScenario("ambiguo");
    renderRoute(["/simulador"]);

    fireEvent.click(screen.getByRole("button", { name: /Ambiguo HITL/i }));

    await waitFor(() => {
      expect(screen.getByText("Requiere revisión del analista")).toBeInTheDocument();
    });
  });

  it("error 503: la evaluación fallida activa el estado de error visible", async () => {
    setScenario("503-servicio-cayido");
    renderRoute(["/simulador"]);

    fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));

    // El texto de error aparece en el banner y en el terminal; getAllByText maneja ambos.
    await waitFor(() => {
      expect(screen.getAllByText(/disponible/i).length).toBeGreaterThan(0);
    });
  });

  it("copyLog: el botón Copiar en el terminal envía la traza al portapapeles", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);

    fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Riesgo bajo" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /Traza/i }));
    fireEvent.click(screen.getByRole("button", { name: /Copiar/i }));
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain("[BAYES]");
    expect(writeText.mock.calls[0][0]).toContain("[VEREDICTO]");
  });
});
