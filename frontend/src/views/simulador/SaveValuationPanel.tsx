import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import type {
  AnalystDecision,
  EvaluationRequest,
  EvaluationResponse,
  ValuationRecord,
} from "../../api/types/evaluation.types";

interface Props {
  request: EvaluationRequest;
  result: EvaluationResponse;
}

/** Decisión que corresponde a cada color del semáforo (se propone por defecto). */
const SUGGESTED: Record<EvaluationResponse["semaforo"], AnalystDecision> = {
  verde: "aprobar",
  amarillo: "revision_comite",
  rojo: "rechazar",
};

const DECISION_LABELS: Record<AnalystDecision, string> = {
  aprobar: "Aprobar",
  revision_comite: "Enviar a comité",
  rechazar: "Rechazar",
};

const ANALYST_KEY = "crediconfianza.analista";

function readAnalyst(): string {
  try {
    return window.localStorage.getItem(ANALYST_KEY) ?? "";
  } catch {
    return "";
  }
}

function rememberAnalyst(name: string): void {
  try {
    window.localStorage.setItem(ANALYST_KEY, name);
  } catch {
    // El navegador puede bloquear el almacenamiento; no es un error del flujo.
  }
}

const INPUT =
  "w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-md px-2.5 py-2 focus:border-coop-forest focus:ring-1 focus:ring-coop-forest";

/**
 * Registro de la decisión humana sobre la evaluación (HU-09, HU-26).
 *
 * El analista identifica al cliente, elige su decisión y escribe el motivo.
 * El backend recalcula la recomendación al guardar, así que lo almacenado es
 * siempre lo que produjo el motor, no lo que muestre la pantalla.
 */
export default function SaveValuationPanel({ request, result }: Props) {
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [analista, setAnalista] = useState(readAnalyst);
  const [decision, setDecision] = useState<AnalystDecision>(SUGGESTED[result.semaforo]);
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<ValuationRecord | null>(null);

  const differs = decision !== SUGGESTED[result.semaforo];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (motivo.trim().length < 10) {
      setError("Escribe el motivo de la decisión (mínimo 10 caracteres).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const record = await apiClient.saveValuation({
        cliente_nombre: nombre.trim(),
        cliente_documento: documento.trim(),
        analista: analista.trim(),
        decision,
        motivo: motivo.trim(),
        observaciones: observaciones.trim() || null,
        solicitud: request,
      });
      rememberAnalyst(analista.trim());
      setSaved(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la valoración.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-emerald-900">
          Valoración #{saved.id} guardada para {saved.cliente_nombre}.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={apiClient.valuationPdfUrl(saved.id)}
            className="inline-flex items-center gap-1.5 rounded-md bg-coop-forest px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Descargar PDF
          </a>
          <Link
            to="/valoraciones"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Ver historial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Guardar valoración del cliente"
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3"
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900">Guardar valoración</h3>
        <p className="text-xs text-slate-600">
          Registra tu decisión. El sistema solo recomienda: la decisión final es tuya.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label className="text-xs font-medium text-slate-700 flex flex-col gap-1">
          Nombre del cliente
          <input
            required
            minLength={2}
            maxLength={120}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={INPUT}
          />
        </label>
        <label className="text-xs font-medium text-slate-700 flex flex-col gap-1">
          Documento o código
          <input
            required
            minLength={3}
            maxLength={30}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className={INPUT}
          />
        </label>
        <label className="text-xs font-medium text-slate-700 flex flex-col gap-1">
          Analista
          <input
            required
            minLength={2}
            maxLength={80}
            value={analista}
            onChange={(e) => setAnalista(e.target.value)}
            className={INPUT}
          />
        </label>
        <label className="text-xs font-medium text-slate-700 flex flex-col gap-1">
          Decisión
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value as AnalystDecision)}
            className={INPUT}
          >
            {(Object.keys(DECISION_LABELS) as AnalystDecision[]).map((key) => (
              <option key={key} value={key}>
                {DECISION_LABELS[key]}
                {key === SUGGESTED[result.semaforo] ? " (sugerida)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {differs ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
          Tu decisión es distinta a la sugerida. Explica el motivo con detalle: quedará marcado en
          la auditoría.
        </p>
      ) : null}

      <label className="text-xs font-medium text-slate-700 flex flex-col gap-1">
        Motivo de la decisión
        <textarea
          required
          minLength={10}
          maxLength={1000}
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej.: arraigo verificado en visita a la parcela; ingresos coherentes con la cosecha."
          className={INPUT}
        />
      </label>
      <label className="text-xs font-medium text-slate-700 flex flex-col gap-1">
        Observaciones (opcional)
        <textarea
          maxLength={2000}
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className={INPUT}
        />
      </label>

      {error ? (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="self-start inline-flex items-center gap-1.5 rounded-md bg-coop-forest px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">save</span>
        {saving ? "Guardando…" : "Guardar valoración"}
      </button>
    </form>
  );
}
