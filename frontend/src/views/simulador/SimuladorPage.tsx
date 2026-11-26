import { useState } from "react";
import { apiClient } from "../../api/client";
import type { EvaluationRequest, EvaluationResponse } from "../../api/types/evaluation.types";
import { ApiError } from "../../api/client";
import Col1Parametros from "./Col1Parametros";
import Col3Resultado from "./Col3Resultado";
import type { FormState } from "./types";

// ── Estado inicial (caso rural legítimo por defecto, como en el stitch) ──────

const BLANK_FORM: FormState = {
  zona: "rural",
  genero: "femenino",
  pertenenciaEtnica: "campesino",
  producto: "agropecuario",
  tipoNegocio: "parcela_finca",
  esEstacional: false,
  monto: 1000000,
  ingresos: 500000,
  plazo: 12,
  edad: 18,
  weak: Array(13).fill(false) as boolean[],
  strong: Array(6).fill(false) as boolean[],
};

const DEFAULT_FORM: FormState = {
  zona: "rural",
  genero: "femenino",
  pertenenciaEtnica: "campesino",
  producto: "agropecuario",
  tipoNegocio: "parcela_finca",
  esEstacional: true,
  monto: 8500000,
  ingresos: 2800000,
  plazo: 36,
  edad: 42,
  // sw-1,2,3,4,6,7,8,13 → índices 0,1,2,3,5,6,7,12
  weak: [true, true, true, true, false, true, true, true, false, false, false, false, true],
  strong: [false, false, false, false, false, false],
};

const CASOS: Record<"rural_legitimo" | "urbano_fraude" | "ambiguo", FormState> = {
  rural_legitimo: { ...DEFAULT_FORM },
  urbano_fraude: {
    zona: "urbana",
    genero: "masculino",
    pertenenciaEtnica: "ninguno",
    producto: "consumo",
    tipoNegocio: "local_fijo",
    esEstacional: false,
    monto: 35000000,
    ingresos: 14000000,
    plazo: 36,
    edad: 29,
    // sw-4, sw-10 → índices 3, 9
    weak: [false, false, false, true, false, false, false, false, false, true, false, false, false],
    // sf-1, sf-2, sf-3 → índices 0, 1, 2
    strong: [true, true, true, false, false, false],
  },
  ambiguo: {
    zona: "rural",
    genero: "masculino",
    pertenenciaEtnica: "indigena",
    producto: "agropecuario",
    tipoNegocio: "plaza_mercado_feria",
    esEstacional: true,
    monto: 22000000,
    ingresos: 3200000,
    plazo: 36,
    edad: 55,
    // sw-1,3,5,8,12 → índices 0,2,4,7,11
    weak: [true, false, true, false, true, false, false, true, false, false, false, true, false],
    // sf-2 → índice 1
    strong: [false, true, false, false, false, false],
  },
};

/**
 * Límites del contrato backend (backend/app/schemas/evaluation.py).
 * La UI acopla sus sliders a estos rangos; el clamp en `buildRequest` es una
 * defensa final para que ningún valor fuera de rango llegue a la API (evita 422).
 */
const LIMITS = {
  monto: { min: 1_000_000, max: 35_000_000 },
  ingresos: { min: 1, max: 20_000_000 },
  plazo: { min: 6, max: 36 },
  edad: { min: 18, max: 72 },
} as const;

/** Recorta `value` al rango [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildRequest(form: FormState): EvaluationRequest {
  return {
    id_solicitud: `SIM-${Date.now()}`,
    tipo_zona: form.zona,
    oficina: form.zona === "rural" ? "Oficina rural (simulador)" : "Oficina urbana (simulador)",
    genero: form.genero,
    pertenencia_etnica: form.pertenenciaEtnica,
    producto_credito: form.producto,
    tipo_negocio: form.tipoNegocio,
    monto_solicitado: clamp(form.monto, LIMITS.monto.min, LIMITS.monto.max),
    plazo_meses: clamp(form.plazo, LIMITS.plazo.min, LIMITS.plazo.max),
    ingresos_declarados: clamp(form.ingresos, LIMITS.ingresos.min, LIMITS.ingresos.max),
    edad_solicitante: clamp(form.edad, LIMITS.edad.min, LIMITS.edad.max),
    es_estacional: form.esEstacional,
    antiguedad_negocio_meses: 36,
    // 13 señales débiles
    sin_historial: form.weak[0],
    vive_lejos: form.weak[1],
    sin_local_fijo: form.weak[2],
    sin_fiador: form.weak[3],
    cedula_otra_region: form.weak[4],
    celular_prepago: form.weak[5],
    sin_cuenta_bancaria: form.weak[6],
    factura_manual: form.weak[7],
    fotos_poco_convincentes: form.weak[8],
    sin_referencias_comerciales: form.weak[9],
    nombre_distinto_recibo: form.weak[10],
    negocio_pequeno_monto: form.weak[11],
    direccion_sin_georreferenciar: form.weak[12],
    // 6 indicadores fuertes
    cedula_alterada: form.strong[0],
    ingresos_inconsistentes: form.strong[1],
    factura_falsa: form.strong[2],
    referencias_falsas: form.strong[3],
    historial_adverso: form.strong[4],
    negocio_inconsistente: form.strong[5],
    fuente_datos: "test",
  };
}

export default function SimuladorPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  // Solicitud exacta que produjo `result`: es la que se guarda en la valoración.
  const [lastRequest, setLastRequest] = useState<EvaluationRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submitForm(f: FormState) {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const request = buildRequest(f);
      const response = await apiClient.evaluate(request);
      setLastRequest(request);
      setResult(response);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setErrorMsg(`Error de validación: ${err.message}`);
        } else {
          setErrorMsg("El servicio de evaluación no está disponible. Intenta de nuevo.");
        }
      } else {
        setErrorMsg("El servicio de evaluación no está disponible. Intenta de nuevo.");
      }
      setStatus("error");
    }
  }

  function handleSubmit() {
    void submitForm(form);
  }

  function handleCargarCaso(tipo: "rural_legitimo" | "urbano_fraude" | "ambiguo") {
    const newForm = CASOS[tipo];
    setForm(newForm);
    setResult(null);
    setStatus("idle");
    // Lanza la evaluación con el nuevo estado directamente
    void submitForm(newForm);
  }

  function handleReset() {
    setForm(BLANK_FORM);
    setResult(null);
    setStatus("idle");
    setErrorMsg(null);
  }

  function handleZona(zona: "rural" | "urbana") {
    const updated: FormState = {
      ...form,
      zona,
      esEstacional: zona === "rural",
      tipoNegocio: zona === "rural" ? "parcela_finca" : "local_fijo",
    };
    setForm(updated);
    // Limpiar resultado al cambiar zona
    setResult(null);
    setStatus("idle");
  }

  function handleField(patch: Partial<Omit<FormState, "weak" | "strong">>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setResult(null);
    setStatus((s) => (s === "success" ? "idle" : s));
  }

  function handleWeak(i: number, v: boolean) {
    setForm((prev) => {
      const weak = [...prev.weak];
      weak[i] = v;
      return { ...prev, weak };
    });
    setResult(null);
    setStatus((s) => (s === "success" ? "idle" : s));
  }

  function handleStrong(i: number, v: boolean) {
    setForm((prev) => {
      const strong = [...prev.strong];
      strong[i] = v;
      return { ...prev, strong };
    });
    setResult(null);
    setStatus((s) => (s === "success" ? "idle" : s));
  }

  return (
    <div className="bg-surface-page font-sans text-on-surface antialiased">
      {/* Encabezado */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Simulador de Inferencia Híbrida y Auditoría Ética
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Reglas expertas, red bayesiana y modelo ML combinados en una recomendación explicable.
            La decisión final siempre es humana.
          </p>
        </div>
      </div>

      {/* Contenido: solicitud (izquierda) y resultado (derecha) */}
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <Col1Parametros
              form={form}
              onZona={handleZona}
              onField={handleField}
              onWeak={handleWeak}
              onStrong={handleStrong}
              onCargarCaso={handleCargarCaso}
              onSubmit={handleSubmit}
              onReset={handleReset}
              loading={status === "loading"}
            />
          </div>
          <div className="lg:col-span-7">
            <Col3Resultado
              status={status}
              result={result}
              request={lastRequest}
              errorMsg={errorMsg}
              form={form}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
