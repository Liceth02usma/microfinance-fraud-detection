/**
 * Resultados reales del sistema para el artículo y la portada.
 *
 * `metricsSnapshot.json` lo genera `backend/scripts/export_metrics.py` sobre
 * el split de prueba con los modelos entrenados. Ninguna cifra de esta capa
 * se escribe a mano: para actualizarlas se vuelve a ejecutar el script.
 */
import snapshot from "./metricsSnapshot.json";

export interface AblationRow {
  name: string;
  description: string;
  auc: number | null;
  precision: number;
  recall: number;
  f1: number;
  fpr: number | null;
  fpr_rural: number | null;
  fpr_urbana: number | null;
  false_positives_rural: number;
  false_positives_urbana: number;
  fpr_gap: number | null;
  alert_rate: number;
}

export const metrics = snapshot;
export const ablation = snapshot.ablation as AblationRow[];
export const checklist = ablation[0];
export const hybrid = ablation[ablation.length - 1];

/** Formatea una proporción como porcentaje en español (coma decimal). */
export function pct(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return "n/d";
  return `${(value * 100).toFixed(digits).replace(".", ",")} %`;
}

/** Formatea un número decimal en español. */
export function num(value: number | null | undefined, digits = 3): string {
  if (value === null || value === undefined) return "n/d";
  return value.toFixed(digits).replace(".", ",");
}

/** Fecha corta de generación del snapshot. */
export const generatedOn: string = new Date(snapshot.generated_at).toLocaleDateString("es-CO", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const zonaParity = snapshot.audit.parity.find((p) => p.attribute === "tipo_zona");
export const fprRural = snapshot.audit.fpr_by_group.find(
  (g) => g.attribute === "tipo_zona" && g.group === "rural",
);
export const fprUrbana = snapshot.audit.fpr_by_group.find(
  (g) => g.attribute === "tipo_zona" && g.group === "urbana",
);
