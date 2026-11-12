import { GovernanceTabs } from "../../components/navigation/GovernanceTabs";
import { MaterialIcon } from "../../components/MaterialIcon";
import { useDisclosure } from "../../hooks/useDisclosure";
import { CONFORMITY_CHECKLIST } from "./data/components";
import { ComponentsMatrix } from "./sections/ComponentsMatrix";
import { HumanRoles } from "./sections/HumanRoles";
import { ProtectedVariables } from "./sections/ProtectedVariables";
import { SignalsTables } from "./sections/SignalsTables";

/**
 * Vista «Componentes & Roles» (ruta `/roles`).
 *
 * Réplica de la pantalla «CrediConfianza - Componentes & Roles (Diseño
 * Refactorizado)» siguiendo el contrato 03: cuatro secciones apiladas
 * (matriz 9 filas, señales 13 + 6, variables protegidas 10, roles 6).
 *
 * El chrome (header/pie) es el compartido de la landing. El botón «Ficha
 * Técnica PDF» invoca la impresión del navegador y «Verificar Conformidad
 * HU-26» despliega el checklist en línea (en lugar del `alert` del diseño).
 */
export function ComponentsRolesView(): JSX.Element {
  const conformity = useDisclosure();

  const handlePrint = (): void => {
    if (typeof window.print === "function") window.print();
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-12">
      {/* Identidad del documento */}
      <div className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-primary-container">
            <MaterialIcon name="verified" className="text-[14px]!" />
            Manual de Gobierno Técnico &amp; Ético (HU-26)
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
            <span className="text-slate-500">Arquitectura Multicapa &amp; Matriz de Decisión</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-slate-900">Componentes &amp; Roles</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Arquitectura multicapa y matriz de responsabilidades del sistema. Detalla la separación
            estricta entre lógica de negocio, inferencia bayesiana y modelo supervisado; clasifica
            las 19 señales de fraude y garantiza equidad y trazabilidad humana. Toda decisión es un
            evento auditado bajo protocolos W3C PROV-O (HU-26).
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-elevation-sm transition-colors hover:bg-slate-50"
          >
            <MaterialIcon name="description" className="text-[18px]!" />
            Ficha Técnica PDF
          </button>
          <button
            type="button"
            onClick={conformity.toggle}
            aria-expanded={conformity.isOpen}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-5 py-3 text-sm font-semibold text-white shadow-elevation-sm transition-colors hover:bg-brand-light"
          >
            <MaterialIcon name="verified" className="text-[18px]!" />
            Verificar Conformidad HU-26
          </button>
        </div>
      </div>

      {conformity.isOpen ? (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Verificación de Conformidad HU-26</h2>
            <button
              type="button"
              onClick={conformity.close}
              className="rounded border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              Entendido
            </button>
          </div>
          <ul className="space-y-1.5">
            {CONFORMITY_CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs">
                <MaterialIcon
                  name="check_circle"
                  className="mt-0.5 shrink-0 text-[14px]! text-emerald-700"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs italic text-emerald-800">
            Firma digital del auditor: pendiente de revisión manual.
          </p>
        </div>
      ) : null}

      <GovernanceTabs />

      <div className="flex flex-col gap-8">
        <ComponentsMatrix />
        <SignalsTables />
        <ProtectedVariables />
        <HumanRoles />
      </div>
    </div>
  );
}
