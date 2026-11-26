import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import type {
  AnalystDecision,
  ValuationList,
  ValuationRecord,
} from "../../api/types/evaluation.types";

const DECISION_LABELS: Record<AnalystDecision, string> = {
  aprobar: "Aprobar",
  revision_comite: "Enviar a comité",
  rechazar: "Rechazar",
};

const SEMAFORO_BADGE: Record<string, string> = {
  verde: "bg-emerald-50 text-emerald-800 border-emerald-200",
  amarillo: "bg-amber-50 text-amber-800 border-amber-200",
  rojo: "bg-rose-50 text-rose-800 border-rose-200",
};

function money(value: number): string {
  return "$ " + value.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function date(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

/** Detalle desplegado de una valoración: motivo, factores y reglas. */
function Detail({ id }: { id: number }) {
  const [record, setRecord] = useState<ValuationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getValuation(id)
      .then((r) => active && setRecord(r))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className="text-sm text-rose-700">{error}</p>;
  if (!record) return <p className="text-sm text-slate-500">Cargando detalle…</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700">
      <div className="flex flex-col gap-2">
        <p>
          <strong className="text-slate-900">Motivo:</strong> {record.motivo}
        </p>
        {record.observaciones ? (
          <p>
            <strong className="text-slate-900">Observaciones:</strong> {record.observaciones}
          </p>
        ) : null}
        <p className="text-xs text-slate-500">
          Reglas {record.resultado.rules_subscore.toFixed(2)} · Bayes{" "}
          {(record.resultado.bayesian_probability * 100).toFixed(2)} % · ML{" "}
          {(record.resultado.ml_probability * 100).toFixed(2)} %
        </p>
        <p className="text-xs text-slate-500 break-all">{record.version_sistema}</p>
      </div>
      <div>
        <strong className="text-slate-900">Factores explicativos</strong>
        <ul className="mt-1 list-disc pl-5 space-y-1">
          {record.resultado.explanatory_factors.map((f, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: f }} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Historial de valoraciones guardadas (HU-26): búsqueda, detalle y descarga
 * en PDF de cada valoración o del historial completo.
 */
export default function ValoracionesPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [data, setData] = useState<ValuationList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiClient.listValuations(q));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(applied);
  }, [applied, load]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setApplied(query);
  }

  const items = data?.items ?? [];
  const discrepancias = items.filter((i) => !i.sigue_recomendacion).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-slate-900">
            Valoraciones de clientes
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Cada valoración guarda la recomendación del sistema y la decisión del analista con su
            motivo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={apiClient.valuationsReportPdfUrl(applied)}
            className="inline-flex items-center gap-1.5 rounded-md bg-coop-forest px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Descargar historial (PDF)
          </a>
          <Link
            to="/simulador"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Nueva valoración
          </Link>
        </div>
      </header>

      <form onSubmit={handleSearch} role="search" className="flex gap-2 max-w-md">
        <label htmlFor="buscar-valoracion" className="sr-only">
          Buscar por cliente, documento o analista
        </label>
        <input
          id="buscar-valoracion"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente, documento o analista"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Buscar
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-rose-700">
          {error} Verifica que el backend esté en ejecución.
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Cargando historial…</p> : null}

      {!loading && !error && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
          <p className="font-semibold">Todavía no hay valoraciones guardadas.</p>
          <p className="text-sm">
            Evalúa una solicitud en el simulador y usa «Guardar valoración».
          </p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <p className="text-sm text-slate-600">
            {data?.total} valoraciones
            {discrepancias > 0
              ? ` · ${discrepancias} con decisión distinta a la recomendación`
              : ""}
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3">Recomendación</th>
                  <th className="px-4 py-3">Decisión</th>
                  <th className="px-4 py-3">Analista</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <FragmentRow
                    key={item.id}
                    open={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                    item={item}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

function FragmentRow({
  item,
  open,
  onToggle,
}: {
  item: ValuationList["items"][number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="align-top">
        <td className="px-4 py-3 whitespace-nowrap text-slate-600">{date(item.created_at)}</td>
        <td className="px-4 py-3">
          <div className="font-semibold text-slate-900">{item.cliente_nombre}</div>
          <div className="text-xs text-slate-500">{item.cliente_documento}</div>
        </td>
        <td className="px-4 py-3 capitalize">{item.tipo_zona}</td>
        <td className="px-4 py-3 text-right whitespace-nowrap">{money(item.monto_solicitado)}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold capitalize ${SEMAFORO_BADGE[item.semaforo]}`}
          >
            {item.semaforo} · {item.risk_score.toFixed(1)}
          </span>
        </td>
        <td className="px-4 py-3">
          {DECISION_LABELS[item.decision]}
          {!item.sigue_recomendacion ? (
            <span className="ml-1 text-xs text-amber-700" title="Distinta a la recomendación">
              (se apartó)
            </span>
          ) : null}
        </td>
        <td className="px-4 py-3">{item.analista}</td>
        <td className="px-4 py-3 whitespace-nowrap text-right">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="mr-3 text-xs font-semibold text-primary hover:underline"
          >
            {open ? "Ocultar" : "Detalle"}
          </button>
          <a
            href={apiClient.valuationPdfUrl(item.id)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            PDF
          </a>
        </td>
      </tr>
      {open ? (
        <tr>
          <td colSpan={8} className="bg-slate-50 px-4 py-4">
            <Detail id={item.id} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
