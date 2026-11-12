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

interface Props {
  form: FormState;
  onZona: (zona: "rural" | "urbana") => void;
  onField: (patch: Partial<Omit<FormState, "weak" | "strong">>) => void;
  onWeak: (i: number, v: boolean) => void;
  onStrong: (i: number, v: boolean) => void;
  onCargarCaso: (tipo: "rural_legitimo" | "urbano_fraude" | "ambiguo") => void;
  onSubmit: () => void;
  loading: boolean;
}

function fmt(n: number): string {
  return "$ " + n.toLocaleString("es-CO") + " COP";
}

export default function Col1Parametros({
  form,
  onZona,
  onField,
  onWeak,
  onStrong,
  onCargarCaso,
  onSubmit,
  loading,
}: Props) {
  const weakCount = form.weak.filter(Boolean).length;
  const strongCount = form.strong.filter(Boolean).length;

  let salvaguardaTag: string;
  let salvaguardaMsg: string;
  let salvaguardaClass: string;
  if (strongCount > 0) {
    salvaguardaTag = "⚠ Alerta objetiva";
    salvaguardaMsg =
      "Se activaron indicadores fuertes de incoherencia o suplantación. Requiere investigación SARO.";
    salvaguardaClass = "text-xs font-semibold text-rose-800 flex items-center gap-1";
  } else if (form.zona === "rural" && weakCount > 0) {
    salvaguardaTag = "🛡 Salvaguarda activa";
    salvaguardaMsg =
      "Solo señales débiles de informalidad. El sistema aplica el tope de salvaguarda rural (HU-18).";
    salvaguardaClass = "text-xs font-semibold text-emerald-800 flex items-center gap-1";
  } else {
    salvaguardaTag = "✓ Evaluación estándar";
    salvaguardaMsg = "Parámetros nominales dentro de la política de crédito urbano formal.";
    salvaguardaClass = "text-xs font-semibold text-slate-700 flex items-center gap-1";
  }

  return (
    <section aria-label="Parámetros del solicitante" className="lg:col-span-4 flex flex-col gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
        {/* Selector de zona */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-coop-accent">place</span>
              Entorno geográfico y socioproductivo
            </span>
            <span className="text-[10px] font-mono text-slate-500">Contexto territorial</span>
          </div>
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium">
            <button
              type="button"
              onClick={() => onZona("urbana")}
              className={`py-1.5 rounded transition-all text-center ${form.zona === "urbana" ? "bg-coop-forest text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Urbano comercial
            </button>
            <button
              type="button"
              onClick={() => onZona("rural")}
              className={`py-1.5 rounded transition-all text-center ${form.zona === "rural" ? "bg-coop-forest text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Rural agropecuario
            </button>
          </div>
          {form.zona === "rural" ? (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-lg text-xs leading-relaxed text-emerald-950 flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0 mt-0.5">
                park
              </span>
              <div>
                <strong className="font-semibold text-emerald-900">Economía campesina:</strong>{" "}
                Operaciones basadas en ciclos de cosecha, comercio veredal y arraigo local. Las
                señales débiles de informalidad no constituyen sospecha de fraude bajo el mandato
                solidario.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-100/90 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-[18px] text-slate-600 shrink-0 mt-0.5">
                apartment
              </span>
              <div>
                <strong className="font-semibold text-slate-900">Economía urbana:</strong> Unidades
                productivas con trazabilidad bancaria formal, obligaciones DIAN y facturación
                electrónica estandarizada.
              </div>
            </div>
          )}
        </div>

        {/* Casos testigo */}
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Casos testigo de auditoría</span>
            <span className="text-[10px] text-slate-500 font-mono">1-click demo</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onCargarCaso("rural_legitimo")}
              className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 transition-colors text-left flex flex-col gap-1 focus:ring-1 focus:ring-emerald-500"
            >
              <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Rural legítimo
              </span>
              <span className="text-[10px] font-mono text-emerald-700">Caficultura · $8.5M</span>
            </button>
            <button
              type="button"
              onClick={() => onCargarCaso("urbano_fraude")}
              className="p-2 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-100/60 transition-colors text-left flex flex-col gap-1 focus:ring-1 focus:ring-rose-500"
            >
              <span className="text-[11px] font-semibold text-rose-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                Urbano fraude
              </span>
              <span className="text-[10px] font-mono text-rose-700">Inconsistencia 5x</span>
            </button>
            <button
              type="button"
              onClick={() => onCargarCaso("ambiguo")}
              className="p-2 rounded-lg border border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 transition-colors text-left flex flex-col gap-1 focus:ring-1 focus:ring-amber-500"
            >
              <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Ambiguo HITL
              </span>
              <span className="text-[10px] font-mono text-amber-700">Inspección campo</span>
            </button>
          </div>
        </div>

        {/* Perfil demográfico */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-500">badge</span>
              Perfil del asociado titular
            </span>
            <span className="text-[10px] font-mono text-slate-500">Ley 1581/2012</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">
                Identidad de género
              </label>
              <select
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded px-2 py-1.5 focus:border-coop-forest focus:ring-1 focus:ring-coop-forest"
                value={form.genero}
                onChange={(e) => onField({ genero: e.target.value as FormState["genero"] })}
              >
                <option value="femenino">Femenino (Mujer Rural)</option>
                <option value="masculino">Masculino</option>
                <option value="otro">No Binario / Otro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">
                Sujeto de especial protección
              </label>
              <select
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded px-2 py-1.5 focus:border-coop-forest focus:ring-1 focus:ring-coop-forest"
                value={form.pertenenciaEtnica}
                onChange={(e) =>
                  onField({ pertenenciaEtnica: e.target.value as FormState["pertenenciaEtnica"] })
                }
              >
                <option value="campesino">Campesinado Sujeto Especial</option>
                <option value="indigena">Indígena en Resguardo</option>
                <option value="afrodescendiente">Comunidad Afrocolombiana</option>
                <option value="ninguno">Sin diferencial étnico</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">
                Línea crediticia
              </label>
              <input
                readOnly
                type="text"
                value="Microcrédito Agropecuario"
                className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded px-2 py-1.5 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">
                Destino productivo
              </label>
              <select className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded px-2 py-1.5 focus:border-coop-forest focus:ring-1 focus:ring-coop-forest">
                <option>Caficultura y Cacao de Ladera</option>
                <option>Hortalizas y Frutales Caducifolios</option>
                <option>Ganadería Sostenible Silvopastoril</option>
                <option>Comercio Veredal y Víveres</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
            <label
              htmlFor="check-estacional"
              className="text-[11px] text-slate-700 font-medium cursor-pointer"
            >
              Ciclos de amortización atados a cosecha (semestral)
            </label>
            <input
              id="check-estacional"
              type="checkbox"
              checked={form.esEstacional}
              onChange={(e) => onField({ esEstacional: e.target.checked })}
              className="w-4 h-4 rounded text-coop-forest focus:ring-coop-forest border-slate-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-3 py-1">
          {/* Monto */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Monto solicitado</span>
              <span className="font-mono text-xs font-semibold text-coop-forest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                {fmt(form.monto)}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={50000000}
              step={500000}
              value={form.monto}
              onChange={(e) => onField({ monto: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-coop-forest"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>$1M</span>
              <span>$25M</span>
              <span>$50M COP</span>
            </div>
          </div>
          {/* Ingresos */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Ingreso mensual ponderado</span>
              <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {fmt(form.ingresos)}
              </span>
            </div>
            <input
              type="range"
              min={500000}
              max={20000000}
              step={100000}
              value={form.ingresos}
              onChange={(e) => onField({ ingresos: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-coop-forest"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>$500k</span>
              <span>$10M</span>
              <span>$20M COP</span>
            </div>
          </div>
          {/* Plazo y Edad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-700 font-medium">Plazo</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">
                  {form.plazo} meses
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={120}
                step={6}
                value={form.plazo}
                onChange={(e) => onField({ plazo: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-coop-forest"
              />
            </div>
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-700 font-medium">Edad</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">
                  {form.edad} años
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={80}
                step={1}
                value={form.edad}
                onChange={(e) => onField({ edad: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-coop-forest"
              />
            </div>
          </div>
        </div>

        {/* 13 señales débiles */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-amber-50/50 p-2.5 flex items-center justify-between border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-950">
                13 Señales Débiles · Informalidad Rural
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              Tope máx 0.10
            </span>
          </div>
          <div className="p-2 space-y-1 max-h-56 overflow-y-auto bg-white text-xs divide-y divide-slate-100">
            {WEAK_LABELS.map(({ label, tooltip }, i) => (
              <label
                key={i}
                title={tooltip}
                className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.weak[i] ?? false}
                    onChange={(e) => onWeak(i, e.target.checked)}
                    className="rounded text-coop-forest focus:ring-coop-forest border-slate-300"
                  />
                  <span className="text-slate-800 text-[11px]">{label}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  Débil
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 6 indicadores fuertes */}
        <div className="border border-rose-200 rounded-lg overflow-hidden">
          <div className="bg-rose-50/60 p-2.5 flex items-center justify-between border-b border-rose-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span className="text-xs font-semibold text-rose-950">
                6 Indicadores Fuertes · Fraude Objetivo
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
              Peso 0.40 c/u
            </span>
          </div>
          <div className="p-2 space-y-1 bg-white text-xs divide-y divide-slate-100">
            {STRONG_LABELS.map((label, i) => (
              <label
                key={i}
                className="flex items-center justify-between py-1 px-1.5 hover:bg-rose-50/50 rounded cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.strong[i] ?? false}
                    onChange={(e) => onStrong(i, e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <span className="text-slate-900 font-medium text-[11px]">{label}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 font-semibold shrink-0">
                  Crítico
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Barra HU-18 */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-medium text-slate-800">
              {weakCount} débiles · {strongCount} fuertes
            </span>
            <span className={salvaguardaClass}>{salvaguardaTag}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">{salvaguardaMsg}</p>
        </div>

        {/* Botón evaluar */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3 px-4 bg-coop-forest hover:bg-coop-accent disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              <span className="text-emerald-100">Procesando tensores y reglas...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px] text-emerald-300">
                psychology_alt
              </span>
              <span className="text-emerald-100 group-hover:text-white">
                Evaluar solicitud con motor híbrido
              </span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
