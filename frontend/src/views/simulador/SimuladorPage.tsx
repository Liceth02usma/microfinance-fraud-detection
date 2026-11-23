import { useState } from "react";
import { apiClient } from "../../api/client";
import type { EvaluationRequest, EvaluationResponse } from "../../api/types/evaluation.types";
import { ApiError } from "../../api/client";
import Col1Parametros from "./Col1Parametros";
import Col2Reglas from "./Col2Reglas";
import Col3Resultado from "./Col3Resultado";
import type { FormState } from "./types";

// ── Estado inicial (caso rural legítimo por defecto, como en el stitch) ──────

const BLANK_FORM: FormState = {
  zona: "rural",
  genero: "femenino",
  pertenenciaEtnica: "campesino",
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
    esEstacional: true,
    monto: 22000000,
    ingresos: 3200000,
    plazo: 24,
    edad: 55,
    // sw-1,3,5,8,12 → índices 0,2,4,7,11
    weak: [true, false, true, false, true, false, false, true, false, false, false, true, false],
    // sf-2 → índice 1
    strong: [false, true, false, false, false, false],
  },
};

function buildRequest(form: FormState): EvaluationRequest {
  return {
    id_solicitud: `SIM-${Date.now()}`,
    tipo_zona: form.zona,
    oficina: form.zona === "rural" ? "Simulador Rural" : "Simulador Urbano",
    genero: form.genero,
    pertenencia_etnica: form.pertenenciaEtnica,
    producto_credito: "agropecuario",
    tipo_negocio: form.zona === "rural" ? "parcela_finca" : "local_fijo",
    monto_solicitado: form.monto,
    plazo_meses: form.plazo,
    ingresos_declarados: form.ingresos,
    edad_solicitante: form.edad,
    es_estacional: form.esEstacional,
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
    modelo_version: "0.1.0-baseline",
    fuente_datos: "test",
  };
}

export default function SimuladorPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submitForm(f: FormState) {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const response = await apiClient.evaluate(buildRequest(f));
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
      {/* Sub-header de estado */}
      <div className="w-full bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-headline-sm text-headline-sm font-bold text-slate-900 tracking-tight">
                Simulador de Inferencia Híbrida y Auditoría Ética
              </h1>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Laboratorio de calibración y análisis causal de créditos para asociadas y asociados
              rurales frente al riesgo de discriminación algorítmica.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto"></div>
        </div>
      </div>

      {/* Contenido principal — 3 columnas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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
          <Col2Reglas form={form} />
          <Col3Resultado status={status} result={result} errorMsg={errorMsg} />
        </div>
      </main>
    </div>
  );
}
