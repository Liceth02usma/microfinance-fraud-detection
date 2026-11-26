/**
 * Contenido estático de la landing: navegación, hero, barra flotante y pie
 * de página.
 *
 * Todo el copy está en español (documentación/contenido) y los identificadores
 * en inglés (código), según las convenciones del repositorio.
 */

import { checklist, hybrid, metrics, num, pct } from "../../../data/metrics";

/** Enlaces principales del encabezado (rutas propias del enrutador). */
export interface NavLink {
  label: string;
  href: string;
}

export const primaryNavLinks: NavLink[] = [
  { label: "Simulador", href: "/simulador" },
  { label: "Valoraciones", href: "/valoraciones" },
  { label: "Arquitectura", href: "/arquitectura" },
  { label: "Componentes y roles", href: "/roles" },
];

/** Ruta del artículo científico (informe del proyecto). */
export const ARTICLE_PATH = "/articulo";

/** Insignias superiores del hero (cifras verificables, sin emojis). */
export interface HeroBadge {
  dotClass: string;
  text: string;
}

export const heroBadges: HeroBadge[] = [
  { dotClass: "bg-brand-light", text: "14 Oficinas (7 Urbanas / 7 Rurales)" },
  { dotClass: "bg-trust-blue", text: "38.000 Asociados" },
  { dotClass: "bg-secondary-container", text: "Prototipo con datos sintéticos" },
  { dotClass: "bg-risk-low", text: "Cartera: $42.000M COP" },
];

export const hero = {
  kicker: {
    left: "Caso de Estudio Cooperativo",
    right: "San Juan de la Vega · Valles Templados",
  },
  title: "Detección de Fraude en Microcrédito Rural con Inteligencia Híbrida y Auditoría Ética",
  subtitle:
    "Reglas expertas, una red bayesiana y XGBoost con explicaciones SHAP, fusionados en un puntaje de riesgo con semáforo. Cada alerta se explica, la equidad entre grupos se mide y la decisión final la toma un analista.",
  cta: { label: "Iniciar Simulador de Riesgo", icon: "analytics", href: "/simulador" },
} as const;

/** Cinta cuantitativa inferior del hero. */
export interface RibbonItem {
  label: string;
  value: string;
  tag: string;
  tagClass: string;
}

const RIBBON_TAG = "bg-brand-light/30 border border-brand-light/40 text-primary-fixed rounded-full";

/** Cifras de la cinta: salen de `metricsSnapshot.json` (script de métricas). */
export const heroRibbon: RibbonItem[] = [
  {
    label: "F1 del sistema híbrido",
    value: num(hybrid.f1),
    tag: `AUC ${num(hybrid.auc)}`,
    tagClass: RIBBON_TAG,
  },
  {
    label: "Rurales legítimos a revisión",
    value: pct(metrics.review_rates_legit.hybrid_rural),
    tag: `Lista de chequeo: ${pct(metrics.review_rates_legit.checklist_rural, 0)}`,
    tagClass: RIBBON_TAG,
  },
  {
    label: "Falsos positivos (prueba)",
    value: `${metrics.headline.false_positives_checklist.toLocaleString("es-CO")} → ${metrics.headline.false_positives_hybrid}`,
    tag: `FPR rural ${pct(hybrid.fpr_rural, 2)}`,
    tagClass: RIBBON_TAG,
  },
  {
    label: "Decisión final",
    value: "Analista",
    tag: "El sistema recomienda",
    tagClass: "bg-surface-container-lowest/15 text-primary-fixed-dim rounded-full",
  },
];

/** Referencia explícita al origen de las cifras de la cinta. */
export const heroRibbonNote = `Resultados sobre ${metrics.test_split.n.toLocaleString("es-CO")} solicitudes sintéticas de prueba. Lista de chequeo simulada: ${pct(checklist.fpr_rural, 0)} de falsos positivos rurales.`;

/** Barra flotante inferior (aparece al superar el umbral de scroll). */
export const stickyBar = {
  title: "Sistema Híbrido de Evaluación de Riesgo de Fraude — CrediConfianza",
  subtitle: "| Valles Templados & San Juan de la Vega",
  ctaLabel: "Probar Simulador Ahora",
  ctaHref: "/simulador",
  /** Píxels de desplazamiento tras los que se muestra (diseño original). */
  scrollThreshold: 450,
} as const;

/** Columnas informativas del pie de página. */
export interface FooterItem {
  label: string;
  /** Ruta interna (puede incluir ancla del artículo). */
  to?: string;
}

export const footerColumns: { title: string; items: FooterItem[] }[] = [
  {
    title: "Marco Regulatorio",
    items: [
      { label: "Hábeas Data financiero · Ley 1266 de 2008", to: "/articulo#articulo-marco-legal" },
      { label: "Ley 2157 de 2021", to: "/articulo#articulo-marco-legal" },
      { label: "Protección de datos · Ley 1581 de 2012", to: "/articulo#articulo-marco-legal" },
      { label: "Política Nacional de IA · CONPES 4144", to: "/articulo#articulo-marco-legal" },
    ],
  },
  {
    title: "Gobernanza y Ética",
    items: [
      { label: "Discusión ética y paridad", to: "/articulo#articulo-discusion" },
      { label: "Reglas y desarrollo del artefacto", to: "/articulo#articulo-desarrollo" },
      { label: "Componentes y roles humanos", to: "/roles" },
      { label: "Historial de valoraciones", to: "/valoraciones" },
    ],
  },
  {
    title: "El proyecto",
    items: [
      { label: "Artículo científico (informe)", to: "/articulo" },
      { label: "Resultados y ablación", to: "/articulo#articulo-resultados" },
      { label: "Arquitectura del sistema", to: "/arquitectura" },
    ],
  },
];

export const footer = {
  brand: "CrediConfianza",
  description:
    "Prototipo académico de detección de fraude con reglas expertas, red bayesiana y aprendizaje automático, con auditoría ética. Caso de estudio ficticio.",
  location: "Ingeniería del conocimiento · 2026-2",
  copyright: "Proyecto académico. CrediConfianza es una cooperativa ficticia del enunciado.",
  version: `Modelo: ${metrics.model_version}`,
} as const;
