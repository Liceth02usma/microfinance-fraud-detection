import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiClient } from "../../src/api/client";
import { server } from "../../src/mocks/server";
import { setScenario } from "../../src/mocks/scenarios";
import { renderRoute } from "../helpers/renderRoute";

/** Evalúa el caso por defecto y llena el formulario de valoración. */
async function evaluateAndFill(decision?: string) {
  fireEvent.click(screen.getByRole("button", { name: /Evaluar solicitud/i }));
  await screen.findByRole("heading", { name: "Riesgo bajo" });
  fireEvent.click(screen.getByRole("tab", { name: /Registrar decisión/i }));
  const form = await screen.findByRole("form", { name: /Guardar valoración del cliente/i });
  const f = within(form);
  fireEvent.change(f.getByLabelText(/Nombre del cliente/i), {
    target: { value: "Ana Rojas (sintético)" },
  });
  fireEvent.change(f.getByLabelText(/Documento o código/i), { target: { value: "CC-555" } });
  fireEvent.change(f.getByLabelText(/^Analista/i), { target: { value: "Analista Demo" } });
  if (decision) {
    fireEvent.change(f.getByLabelText(/^Decisión/i), { target: { value: decision } });
  }
  return f;
}

describe("Guardar valoración desde el simulador", () => {
  it("propone la decisión del semáforo y exige motivo", async () => {
    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);
    const f = await evaluateAndFill();

    expect(f.getByLabelText(/^Decisión/i)).toHaveValue("aprobar");
    fireEvent.change(f.getByLabelText(/Motivo de la decisión/i), { target: { value: "corto" } });
    fireEvent.submit(f.getByRole("button", { name: /Guardar valoración/i }));
    expect(await f.findByRole("alert")).toHaveTextContent(/mínimo 10 caracteres/i);
  });

  it("guarda, ofrece el PDF y aparece en el historial", async () => {
    setScenario("rural-legitimo");
    renderRoute(["/simulador"]);
    const f = await evaluateAndFill("rechazar");

    expect(f.getByText(/distinta a la sugerida/i)).toBeInTheDocument();
    fireEvent.change(f.getByLabelText(/Motivo de la decisión/i), {
      target: { value: "Documentos del predio no verificables en visita." },
    });
    fireEvent.click(f.getByRole("button", { name: /Guardar valoración/i }));

    const pdf = await screen.findByRole("link", { name: /Descargar PDF/i });
    expect(pdf).toHaveAttribute("href", apiClient.valuationPdfUrl(1));
    expect(screen.getByText(/Valoración #1 guardada/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /Ver historial/i }));
    expect(await screen.findByText("Ana Rojas (sintético)")).toBeInTheDocument();
    expect(screen.getByText(/se apartó/i)).toBeInTheDocument();
    expect(screen.getByText(/1 con decisión distinta/i)).toBeInTheDocument();
  });

  it("muestra el error del backend si no se puede guardar", async () => {
    setScenario("rural-legitimo");
    server.use(
      http.post("*/api/v1/valuations", () =>
        HttpResponse.json({ detail: "Base de datos no disponible" }, { status: 503 }),
      ),
    );
    renderRoute(["/simulador"]);
    const f = await evaluateAndFill();
    fireEvent.change(f.getByLabelText(/Motivo de la decisión/i), {
      target: { value: "Arraigo verificado por la junta comunal." },
    });
    fireEvent.click(f.getByRole("button", { name: /Guardar valoración/i }));
    expect(await f.findByRole("alert")).toHaveTextContent(/Base de datos no disponible/i);
  });
});

describe("ValoracionesPage (ruta /valoraciones)", () => {
  it("muestra el estado vacío y el enlace de descarga del historial", async () => {
    renderRoute(["/valoraciones"]);
    expect(await screen.findByText(/Todavía no hay valoraciones/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Descargar historial/i })).toHaveAttribute(
      "href",
      apiClient.valuationsReportPdfUrl(""),
    );
  });

  it("busca, despliega el detalle y enlaza el PDF de cada valoración", async () => {
    setScenario("ambiguo");
    await apiClient.saveValuation({
      cliente_nombre: "Pedro Gil (sintético)",
      cliente_documento: "CC-777",
      analista: "Analista Demo",
      decision: "revision_comite",
      motivo: "Ingresos por verificar con la cooperativa de acopio.",
      solicitud: {
        id_solicitud: "SIM-1",
        tipo_zona: "rural",
        oficina: "Oficina rural",
        genero: "masculino",
        pertenencia_etnica: "campesino",
        producto_credito: "agropecuario",
        tipo_negocio: "parcela_finca",
        monto_solicitado: 5_000_000,
        plazo_meses: 12,
        ingresos_declarados: 900_000,
        edad_solicitante: 45,
        es_estacional: true,
        sin_historial: true,
        vive_lejos: false,
        sin_local_fijo: false,
        sin_fiador: false,
        cedula_otra_region: false,
        celular_prepago: false,
        sin_cuenta_bancaria: false,
        factura_manual: false,
        fotos_poco_convincentes: false,
        sin_referencias_comerciales: false,
        nombre_distinto_recibo: false,
        negocio_pequeno_monto: false,
        direccion_sin_georreferenciar: false,
        cedula_alterada: false,
        ingresos_inconsistentes: true,
        factura_falsa: false,
        referencias_falsas: false,
        historial_adverso: false,
        negocio_inconsistente: false,
        antiguedad_negocio_meses: 60,
        modelo_version: null,
        fuente_datos: "test",
      },
      observaciones: null,
    });

    renderRoute(["/valoraciones"]);
    expect(await screen.findByText("Pedro Gil (sintético)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF" })).toHaveAttribute(
      "href",
      apiClient.valuationPdfUrl(1),
    );

    fireEvent.click(screen.getByRole("button", { name: "Detalle" }));
    expect(await screen.findByText(/Ingresos por verificar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar" }));

    fireEvent.change(screen.getByLabelText(/Buscar por cliente/i), {
      target: { value: "nadie" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(await screen.findByText(/Todavía no hay valoraciones/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Descargar historial/i })).toHaveAttribute(
      "href",
      apiClient.valuationsReportPdfUrl("nadie"),
    );
  });

  it("informa si el backend no responde", async () => {
    server.use(
      http.get("*/api/v1/valuations", () =>
        HttpResponse.json({ detail: "caído" }, { status: 503 }),
      ),
    );
    renderRoute(["/valoraciones"]);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/No se pudo cargar el historial/i),
    );
  });
});
