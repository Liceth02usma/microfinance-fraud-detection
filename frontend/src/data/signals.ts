/**
 * Nombres de las señales en el mismo orden que `FormState.weak` / `.strong`
 * y que el contrato del backend (`backend/app/data/schema.py`).
 *
 * No contiene pesos ni reglas: esos valores se leen de `GET /api/v1/knowledge`.
 */

export const WEAK_SIGNAL_NAMES = [
  "sin_historial",
  "vive_lejos",
  "sin_local_fijo",
  "sin_fiador",
  "cedula_otra_region",
  "celular_prepago",
  "sin_cuenta_bancaria",
  "factura_manual",
  "fotos_poco_convincentes",
  "sin_referencias_comerciales",
  "nombre_distinto_recibo",
  "negocio_pequeno_monto",
  "direccion_sin_georreferenciar",
] as const;

export const STRONG_SIGNAL_NAMES = [
  "cedula_alterada",
  "ingresos_inconsistentes",
  "factura_falsa",
  "referencias_falsas",
  "historial_adverso",
  "negocio_inconsistente",
] as const;

export type WeakSignalName = (typeof WEAK_SIGNAL_NAMES)[number];
export type StrongSignalName = (typeof STRONG_SIGNAL_NAMES)[number];

/**
 * Etiquetas cortas en lenguaje claro para cada variable de la red bayesiana
 * y del modelo ML (se usan en el panel de razonamiento).
 */
export const SIGNAL_LABELS: Record<WeakSignalName | StrongSignalName, string> = {
  sin_historial: "Sin historial crediticio",
  vive_lejos: "Vive lejos de la oficina",
  sin_local_fijo: "Sin local fijo",
  sin_fiador: "Sin fiador",
  cedula_otra_region: "Cédula de otra región",
  celular_prepago: "Celular prepago",
  sin_cuenta_bancaria: "Sin cuenta bancaria",
  factura_manual: "Factura manual",
  fotos_poco_convincentes: "Fotos poco convincentes",
  sin_referencias_comerciales: "Sin referencias comerciales",
  nombre_distinto_recibo: "Nombre distinto al del recibo",
  negocio_pequeno_monto: "Negocio pequeño para el monto",
  direccion_sin_georreferenciar: "Dirección sin georreferenciar",
  cedula_alterada: "Cédula alterada",
  ingresos_inconsistentes: "Ingresos inconsistentes",
  factura_falsa: "Factura falsa",
  referencias_falsas: "Referencias falsas",
  historial_adverso: "Historial adverso",
  negocio_inconsistente: "Negocio inconsistente",
};

/** Etiqueta legible de una variable; si no está catalogada, se humaniza el nombre. */
export function signalLabel(name: string): string {
  return (
    (SIGNAL_LABELS as Record<string, string>)[name] ??
    name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ")
  );
}
