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
    border: "border-trust-blue/30",
    badge: "bg-trust-blue/10 text-trust-blue",
    title: "text-trust-blue",
    legend: "border-trust-blue/20 bg-trust-blue/10 text-trust-blue",
    legendDot: "bg-trust-blue",
    hoverBorder: "hover:border-trust-blue",
    active: "border-trust-blue shadow-[0_0_0_2px_#0284c7,0_8px_20px_-4px_rgba(2,132,199,0.2)]",
    iconBox: "bg-trust-blue/10 text-trust-blue",
    footer: "text-trust-blue",
  },
  B: {
    border: "border-bias-warning/30",
    badge: "bg-bias-warning/10 text-bias-warning",
    title: "text-bias-warning",
    legend: "border-bias-warning/20 bg-bias-warning/10 text-bias-warning",
    legendDot: "bg-bias-warning",
    hoverBorder: "hover:border-bias-warning",
    active: "border-bias-warning shadow-[0_0_0_2px_#6d28d9,0_8px_20px_-4px_rgba(109,40,217,0.22)]",
    iconBox: "bg-bias-warning/10 text-bias-warning",
    footer: "text-bias-warning",
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
