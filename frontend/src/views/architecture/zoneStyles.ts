/**
 * Estilos por zona del mapa de arquitectura.
 *
 * Los valores provienen del diseño «CrediConfianza - Mapa Interactivo de
 * Arquitectura (Tema Claro)» de Stitch. Zona A usa la escala `sky` (equivalente
 * exacto al `trust-blue` del diseño: #0284C7), Zona B la escala `violet`
 * (#7C3AED) y Zona C la identidad cooperativa (`primary-container`/`brand-soft`).
 */
export type ZoneKey = "A" | "B" | "C";

export interface ZoneStyles {
  /** Borde de la tarjeta contenedora de la zona. */
  border: string;
  /** Badge con la letra de la zona. */
  badge: string;
  /** Color del título de la zona. */
  title: string;
  /** Pastilla de la leyenda del encabezado. */
  legend: string;
  /** Punto de color de la leyenda. */
  legendDot: string;
  /** Borde al pasar el cursor sobre un nodo. */
  hoverBorder: string;
  /** Borde + anillo del nodo seleccionado. */
  active: string;
  /** Caja de icono del nodo. */
  iconBox: string;
  /** Texto del enlace/etiqueta del pie del nodo. */
  footer: string;
}

export const ZONE_STYLES: Record<ZoneKey, ZoneStyles> = {
  A: {
    border: "border-sky-200",
    badge: "bg-sky-100 text-sky-600",
    title: "text-sky-600",
    legend: "border-sky-200 bg-sky-100 text-sky-600",
    legendDot: "bg-sky-600",
    hoverBorder: "hover:border-sky-600",
    active: "border-sky-600 shadow-[0_0_0_2px_#0284c7,0_8px_20px_-4px_rgba(2,132,199,0.2)]",
    iconBox: "bg-sky-100 text-sky-600",
    footer: "text-sky-600",
  },
  B: {
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-600",
    title: "text-violet-600",
    legend: "border-violet-200 bg-violet-100 text-violet-600",
    legendDot: "bg-violet-600",
    hoverBorder: "hover:border-violet-600",
    active: "border-violet-600 shadow-[0_0_0_2px_#7c3aed,0_8px_20px_-4px_rgba(124,58,237,0.22)]",
    iconBox: "bg-violet-100 text-violet-600",
    footer: "text-violet-600",
  },
  C: {
    border: "border-primary-container/30",
    badge: "bg-brand-soft text-primary-container",
    title: "text-primary-container",
    legend: "border-primary-container/20 bg-brand-soft text-primary-container",
    legendDot: "bg-primary-container",
    hoverBorder: "hover:border-primary-container",
    active:
      "border-primary-container shadow-[0_0_0_2px_#15573f,0_8px_20px_-4px_rgba(21,87,63,0.22)]",
    iconBox: "bg-brand-soft text-primary-container",
    footer: "text-primary-container",
  },
};
