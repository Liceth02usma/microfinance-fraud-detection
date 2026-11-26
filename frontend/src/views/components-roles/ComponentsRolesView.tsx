import { MaterialIcon } from "../../components/MaterialIcon";
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
 * El chrome (header/pie) es el compartido de la landing.
 */
export function ComponentsRolesView(): JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-12">
      {/* Identidad del documento */}
      <div className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs font-bold text-primary-container">
            <MaterialIcon name="verified" className="text-[14px]!" />
            Manual de Gobierno Técnico &amp; Ético
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
            <span className="text-slate-500">Arquitectura Multicapa &amp; Matriz de Decisión</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-slate-900">Componentes &amp; Roles</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Arquitectura multicapa y matriz de responsabilidades del sistema. Detalla la separación
            estricta entre lógica de negocio, inferencia bayesiana y modelo supervisado; clasifica
            las 19 señales de fraude y garantiza equidad y trazabilidad humana. Toda decisión es un
            evento auditado bajo protocolos W3C PROV-O.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <ComponentsMatrix />
        <SignalsTables />
        <ProtectedVariables />
        <HumanRoles />
      </div>
    </div>
  );
}
