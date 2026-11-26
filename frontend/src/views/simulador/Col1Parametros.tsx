import { MaterialIcon } from "../../components/MaterialIcon";
import { STRONG_SIGNAL_NAMES, WEAK_SIGNAL_NAMES, signalLabel } from "../../data/signals";
import Accordion from "./Accordion";
import type { FormState } from "./types";

const WEAK_LABELS: { label: string; tooltip: string }[] = [
  {
    label: "1. Sin historial crediticio registrado",
    tooltip: "Campesinos sin experiencia bancaria previa",
  },
  {
    label: "2. Ubicación distante de cabecera municipal",
    tooltip: "Finca en vereda distante de cabecera municipal",
  },
  {
    label: "3. Sin establecimiento de comercio fijo",
    tooltip: "Producción en parcela agraria o venta en plaza dominical",
  },
  {
    label: "4. Sin fiador o codeudor institucional",
    tooltip: "Garantía solidaria comunitaria o aval JAC",
  },
  {
    label: "5. Cédula expedida en municipio distinto",
    tooltip: "Movilidad intermunicipal o desplazamiento histórico forzado",
  },
  {
    label: "6. Línea móvil prepago (sin plan pospago)",
    tooltip: "Línea celular en modalidad prepago veredal",
  },
  {
    label: "7. Sin cuenta bancaria previa en entidades",
    tooltip: "Primer acceso formal a través de cooperativa",
  },
  {
    label: "8. Factura manual en talonario físico (Ley 2157)",
    tooltip: "Soporte mediante talonario físico de almacén veredal",
  },
  {
    label: "9. Evidencia fotográfica rústica de la cosecha",
    tooltip: "Fotografía tomada en terreno por asesor de crédito",
  },
  {
    label: "10. Sin referencias comerciales bancarizadas",
    tooltip: "Aval testimonial de la Junta de Acción Comunal",
  },
  {
    label: "11. Recibo de energía a nombre de familiar",
    tooltip: "Predio en aparcería o sucesión familiar indivisa",
  },
  {
    label: "12. Ratio monto/parcela alto por renovación",
    tooltip: "Inversión intensiva en fase de preparación de suelos",
  },
  {
    label: "13. Dirección rural descriptiva (sin placa catastral)",
    tooltip: "Toponimia veredal sin nomenclatura formal",
  },
];

const STRONG_LABELS: string[] = [
  "1. Cédula alterada / No coincidencia en ANI",
  "2. Ingresos sobrefacturados (>5x capacidad real)",
  "3. Factura apócrifa o RUT DIAN inexistente",
  "4. Referencias coludidas (mismo teléfono múltiple)",
  "5. Coincidencia en listas restrictivas SARO",
  "6. Predio fantasma verificado por asesor agrario",
];

const GENERO_LABEL: Record<FormState["genero"], string> = {
  femenino: "Mujer",
  masculino: "Hombre",
  otro: "No binario / otro",
};
const ETNIA_LABEL: Record<FormState["pertenenciaEtnica"], string> = {
  campesino: "Campesina/o",
  indigena: "Indígena",
  afrodescendiente: "Afrocolombiana/o",
  ninguno: "Sin diferencial étnico",
};
const NEGOCIO_LABEL: Record<FormState["tipoNegocio"], string> = {
  parcela_finca: "Parcela o finca",
  plaza_mercado_feria: "Plaza o feria",
  local_fijo: "Local fijo",
  servicios_domicilio: "Servicios a domicilio",
};

interface Props {
  form: FormState;
  onZona: (zona: "rural" | "urbana") => void;
  onField: (patch: Partial<Omit<FormState, "weak" | "strong">>) => void;
  onWeak: (i: number, v: boolean) => void;
  onStrong: (i: number, v: boolean) => void;
  onCargarCaso: (tipo: "rural_legitimo" | "urbano_fraude" | "ambiguo") => void;
  onSubmit: () => void;
  onReset: () => void;
  loading: boolean;
}

function fmt(n: number): string {
  return "$ " + n.toLocaleString("es-CO") + " COP";
}

/** Formato compacto para la línea de resumen: 8500000 → "$8,5 M". */
function fmtShort(n: number): string {
  return `$${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
}

const SELECT_CLASS =
  "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg px-2.5 py-2 focus:border-coop-forest focus:ring-1 focus:ring-coop-forest";

function CountBadge({ n, total, tone }: { n: number; total: number; tone: "amber" | "rose" }) {
  const active =
    tone === "amber"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : "bg-rose-100 text-rose-900 border-rose-200";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
        n > 0 ? active : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {n} / {total}
    </span>
  );
}

interface SliderRowProps {
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, display, min, max, step, value, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono font-semibold tabular-nums text-slate-900">{display}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-coop-forest"
      />
    </div>
  );
}

const CASES: {
  key: "rural_legitimo" | "urbano_fraude" | "ambiguo";
  label: string;
  dot: string;
}[] = [
  { key: "rural_legitimo", label: "Rural legítimo", dot: "bg-emerald-600" },
  { key: "urbano_fraude", label: "Urbano fraude", dot: "bg-rose-600" },
  { key: "ambiguo", label: "Ambiguo HITL", dot: "bg-amber-500" },
];

const ZONAS = [
  ["urbana", "Urbano comercial"],
  ["rural", "Rural agropecuario"],
] as const;

/**
 * Columna de la solicitud. La información se agrupa en bloques plegables con
 * una línea de resumen, para que la vista no se sature sin ocultar datos.
 */
export default function Col1Parametros({
  form,
  onZona,
  onField,
  onWeak,
  onStrong,
  onCargarCaso,
  onSubmit,
  onReset,
  loading,
}: Props) {
  const weakCount = form.weak.filter(Boolean).length;
  const strongCount = form.strong.filter(Boolean).length;

  let salvaguardaTag: string;
  let salvaguardaMsg: string;
  let salvaguardaClass: string;
  if (strongCount > 0) {
    salvaguardaTag = "Alerta objetiva";
    salvaguardaMsg =
      "Se activaron indicadores fuertes de incoherencia o suplantación. Requiere investigación SARO.";
    salvaguardaClass = "bg-rose-50 border-rose-200 text-rose-900";
  } else if (form.zona === "rural" && weakCount > 0) {
    salvaguardaTag = "Salvaguarda activa";
    salvaguardaMsg =
      "Solo señales débiles de informalidad: se aplica el tope de salvaguarda rural.";
    salvaguardaClass = "bg-emerald-50 border-emerald-200 text-emerald-900";
  } else {
    salvaguardaTag = "Evaluación estándar";
    salvaguardaMsg = "Parámetros nominales dentro de la política de crédito.";
    salvaguardaClass = "bg-slate-50 border-slate-200 text-slate-800";
  }

  const activeWeak = WEAK_SIGNAL_NAMES.filter((_, i) => form.weak[i]);
  const activeStrong = STRONG_SIGNAL_NAMES.filter((_, i) => form.strong[i]);

  const profileSummary = [
    GENERO_LABEL[form.genero],
    ETNIA_LABEL[form.pertenenciaEtnica],
    NEGOCIO_LABEL[form.tipoNegocio],
    fmtShort(form.monto),
    `${form.plazo} meses`,
    `${form.edad} años`,
  ].join(" · ");

  return (
    <section
      aria-label="Parámetros del solicitante"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Solicitud</h2>
          <span className="text-[11px] text-slate-500">Datos simulados · Ley 1581/2012</span>
        </div>

        {/* Zona */}
        <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 text-sm font-medium">
          {ZONAS.map(([z, label]) => (
            <button
              key={z}
              type="button"
              aria-pressed={form.zona === z}
              onClick={() => onZona(z)}
              className={`rounded-md py-1.5 text-center transition-all ${
                form.zona === z
                  ? "bg-white font-semibold text-coop-forest shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          {form.zona === "rural" ? (
            <>
              <strong className="font-semibold text-emerald-900">Economía campesina:</strong> ciclos
              de cosecha, comercio veredal y arraigo local. La informalidad no constituye sospecha
              de fraude.
            </>
          ) : (
            <>
              <strong className="font-semibold text-slate-900">Economía urbana:</strong>{" "}
              trazabilidad bancaria formal, obligaciones DIAN y facturación electrónica.
            </>
          )}
        </p>

        {/* Casos testigo */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Casos testigo:</span>
          {CASES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => onCargarCaso(c.key)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5">
        {/* Perfil y crédito */}
        <Accordion
          title="Perfil y crédito"
          icon="badge"
          summary={<p className="text-xs text-slate-500">{profileSummary}</p>}
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-600">
                Identidad de género
                <select
                  className={`mt-1 ${SELECT_CLASS}`}
                  value={form.genero}
                  onChange={(e) => onField({ genero: e.target.value as FormState["genero"] })}
                >
                  <option value="femenino">Femenino (Mujer Rural)</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">No Binario / Otro</option>
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Sujeto de especial protección
                <select
                  className={`mt-1 ${SELECT_CLASS}`}
                  value={form.pertenenciaEtnica}
                  onChange={(e) =>
                    onField({
                      pertenenciaEtnica: e.target.value as FormState["pertenenciaEtnica"],
                    })
                  }
                >
                  <option value="campesino">Campesinado Sujeto Especial</option>
                  <option value="indigena">Indígena en Resguardo</option>
                  <option value="afrodescendiente">Comunidad Afrocolombiana</option>
                  <option value="ninguno">Sin diferencial étnico</option>
                </select>
              </label>
              <label htmlFor="sel-producto" className="text-xs font-medium text-slate-600">
                Producto de crédito
                <select
                  id="sel-producto"
                  className={`mt-1 ${SELECT_CLASS}`}
                  value={form.producto}
                  onChange={(e) => onField({ producto: e.target.value as FormState["producto"] })}
                >
                  <option value="agropecuario">Agropecuario</option>
                  <option value="microempresa">Microempresa</option>
                  <option value="consumo">Consumo</option>
                  <option value="vivienda">Vivienda</option>
                </select>
              </label>
              <label htmlFor="sel-negocio" className="text-xs font-medium text-slate-600">
                Tipo de negocio
                <select
                  id="sel-negocio"
                  className={`mt-1 ${SELECT_CLASS}`}
                  value={form.tipoNegocio}
                  onChange={(e) =>
                    onField({ tipoNegocio: e.target.value as FormState["tipoNegocio"] })
                  }
                >
                  <option value="parcela_finca">Parcela o finca</option>
                  <option value="plaza_mercado_feria">Plaza de mercado o feria</option>
                  <option value="local_fijo">Local fijo</option>
                  <option value="servicios_domicilio">Servicios a domicilio</option>
                </select>
              </label>
            </div>
            <label
              htmlFor="check-estacional"
              className="flex cursor-pointer items-center justify-between gap-3 text-xs font-medium text-slate-700"
            >
              Ciclos de amortización atados a cosecha (semestral)
              <input
                id="check-estacional"
                type="checkbox"
                checked={form.esEstacional}
                onChange={(e) => onField({ esEstacional: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-coop-forest focus:ring-coop-forest"
              />
            </label>
            <SliderRow
              label="Monto solicitado"
              display={fmt(form.monto)}
              min={1000000}
              max={35000000}
              step={500000}
              value={form.monto}
              onChange={(v) => onField({ monto: v })}
            />
            <SliderRow
              label="Ingreso mensual ponderado"
              display={fmt(form.ingresos)}
              min={500000}
              max={20000000}
              step={100000}
              value={form.ingresos}
              onChange={(v) => onField({ ingresos: v })}
            />
            <div className="grid grid-cols-2 gap-4">
              <SliderRow
                label="Plazo"
                display={`${form.plazo} meses`}
                min={6}
                max={36}
                step={6}
                value={form.plazo}
                onChange={(v) => onField({ plazo: v })}
              />
              <SliderRow
                label="Edad"
                display={`${form.edad} años`}
                min={18}
                max={72}
                step={1}
                value={form.edad}
                onChange={(v) => onField({ edad: v })}
              />
            </div>
          </div>
        </Accordion>

        {/* Señales débiles */}
        <Accordion
          title="Señales débiles"
          icon="warning"
          badge={<CountBadge n={weakCount} total={13} tone="amber" />}
          summary={
            activeWeak.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="Señales débiles marcadas">
                {activeWeak.map((name) => (
                  <li
                    key={name}
                    className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900"
                  >
                    {signalLabel(name)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">Ninguna marcada.</p>
            )
          }
        >
          <p className="mb-2 text-xs text-slate-500">
            Informalidad típica: no implica fraude por sí sola en contexto rural. Tope de aporte
            0.10 sin indicios fuertes.
          </p>
          <div className="flex flex-col divide-y divide-slate-100">
            {WEAK_LABELS.map(({ label, tooltip }, i) => (
              <label
                key={i}
                title={tooltip}
                className="flex cursor-pointer items-start gap-2.5 py-1.5 text-xs text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={form.weak[i] ?? false}
                  onChange={(e) => onWeak(i, e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-coop-forest focus:ring-coop-forest"
                />
                <span>
                  {label}
                  <span className="block text-[11px] text-slate-500">{tooltip}</span>
                </span>
              </label>
            ))}
          </div>
        </Accordion>

        {/* Indicios fuertes */}
        <Accordion
          title="Indicios fuertes"
          icon="gpp_maybe"
          badge={<CountBadge n={strongCount} total={6} tone="rose" />}
          summary={
            activeStrong.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="Indicios fuertes marcados">
                {activeStrong.map((name) => (
                  <li
                    key={name}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-900"
                  >
                    {signalLabel(name)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">Ninguno marcado.</p>
            )
          }
        >
          <p className="mb-2 text-xs text-slate-500">
            Evidencia objetiva de fraude (peso 0.40 c/u). Uno solo nunca deja el caso en verde.
          </p>
          <div className="flex flex-col divide-y divide-slate-100">
            {STRONG_LABELS.map((label, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-2.5 py-1.5 text-xs font-medium text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={form.strong[i] ?? false}
                  onChange={(e) => onStrong(i, e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                {label}
              </label>
            ))}
          </div>
        </Accordion>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 p-5">
        {/* Estado de salvaguarda HU-18 */}
        <div className={`rounded-lg border px-3 py-2 text-xs ${salvaguardaClass}`}>
          <div className="flex items-center justify-between font-semibold">
            <span>{salvaguardaTag}</span>
            <span className="font-mono font-medium">
              {weakCount} débiles · {strongCount} fuertes
            </span>
          </div>
          <p className="mt-0.5 leading-snug opacity-90">{salvaguardaMsg}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-coop-forest px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coop-accent disabled:opacity-60"
          >
            <MaterialIcon
              name={loading ? "refresh" : "psychology_alt"}
              className={`text-[18px] ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Procesando..." : "Evaluar solicitud"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            title="Limpiar todos los campos y señales"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <MaterialIcon name="restart_alt" className="text-[18px]" />
            <span className="hidden text-xs font-medium sm:inline">Limpiar</span>
          </button>
        </div>
      </div>
    </section>
  );
}
