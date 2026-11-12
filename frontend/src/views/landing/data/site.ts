/**
 * Contenido estático de la landing: navegación, hero, barra flotante,
 * secciones reservadas y pie de página.
 *
 * Todo el copy está en español (documentación/contenido) y los identificadores
 * en inglés (código), según las convenciones del repositorio.
 */

/** Enlaces principales del encabezado. */
export interface NavLink {
  label: string;
  href: string;
  /** Ruta (`data-path`) que se resalta cuando la sección está visible. */
  path: string;
}

export const primaryNavLinks: NavLink[] = [
  { label: "Arquitectura", href: "#arquitectura", path: "arquitectura" },
  { label: "Simulador", href: "#simulador", path: "simulador" },
  { label: "Componentes y roles", href: "#roles", path: "roles" },
];

/** Insignias superiores del hero (cifras verificables, sin emojis). */
export interface HeroBadge {
  dotClass: string;
  text: string;
}

export const heroBadges: HeroBadge[] = [
  { dotClass: "bg-brand-light", text: "14 Oficinas (7 Urbanas / 7 Rurales)" },
  { dotClass: "bg-trust-blue", text: "38.000 Asociados" },
  { dotClass: "bg-secondary-container", text: "Hábeas Data Ley 2157 & CONPES 4144" },
  { dotClass: "bg-risk-low", text: "Cartera: $42.000M COP" },
];

export const hero = {
  kicker: {
    left: "Caso de Estudio Cooperativo",
    right: "San Juan de la Vega, Cundinamarca",
  },
  title: "Detección de Fraude en Microcrédito Rural con Inteligencia Híbrida y Auditoría Ética",
  subtitle:
    "Arquitectura tripartita de Ontologías RDFS/OWL, Redes Bayesianas Condicionales y XGBoost con explicabilidad SHAP para San Juan de la Vega y Valles Templados. Equidad algorítmica probada frente a la informalidad rural y las cosechas estacionales.",
  cta: { label: "Iniciar Simulador de Riesgo", icon: "analytics", href: "#simulador" },
} as const;

/** Cinta cuantitativa inferior del hero. */
export interface RibbonItem {
  label: string;
  value: string;
  tag: string;
  tagClass: string;
}

export const heroRibbon: RibbonItem[] = [
  {
    label: "Demora Base vs Meta",
    value: "15d → 48h",
    tag: "-87%",
    tagClass: "bg-brand-light/30 border border-brand-light/40 text-primary-fixed rounded-full",
  },
  {
    label: "Razón FPR Rural/Urbano",
    value: "1.04",
    tag: "Rango 0.8-1.25",
    tagClass: "bg-brand-light/30 border border-brand-light/40 text-primary-fixed rounded-full",
  },
  {
    label: "Reducción Falsos Positivos",
    value: "41.2%",
    tag: "F1: 0.884",
    tagClass: "bg-brand-light/30 border border-brand-light/40 text-primary-fixed rounded-full",
  },
  {
    label: "Supervisión Decisional",
    value: "100% Humana",
    tag: "Zero Black Box",
    tagClass: "bg-surface-container-lowest/15 text-primary-fixed-dim rounded-full",
  },
];

/** Barra flotante inferior (aparece al superar el umbral de scroll). */
export const stickyBar = {
  title: "Sistema Híbrido de Evaluación de Riesgo de Fraude — CrediConfianza",
  subtitle: "| Valles Templados & San Juan de la Vega",
  ctaLabel: "Probar Simulador Ahora",
  ctaHref: "#simulador",
  /** Píxels de desplazamiento tras los que se muestra (diseño original). */
  scrollThreshold: 450,
} as const;

/** Secciones reservadas del diseño original (anclas sin contenido en Stitch). */
export interface PlaceholderSection {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const placeholderSections: PlaceholderSection[] = [
  {
    id: "arquitectura",
    icon: "architecture",
    title: "Arquitectura Híbrida Explicable",
    description:
      "Diagrama de la arquitectura tripartita: reglas ontológicas OWL (25%), red bayesiana causal (35%) y XGBoost con atribuciones SHAP (40%).",
  },
  {
    id: "simulador",
    icon: "tune",
    title: "Simulador Interactivo de Riesgo",
    description:
      "Evaluación de señales débiles y fuertes con fusión ponderada de los tres motores y clasificación de riesgo por umbrales.",
  },
  {
    id: "roles",
    icon: "groups",
    title: "Componentes y Roles Institucionales",
    description:
      "Oficial de crédito, comité de crédito, agrónomo de zona y comité de ética: responsabilidades en el protocolo de decisión humana.",
  },
];

/** Columnas informativas del pie de página. */
export const footerColumns: { title: string; items: string[]; isLink: boolean }[] = [
  {
    title: "Marco Regulatorio",
    isLink: false,
    items: [
      "Superintendencia de la Economía Solidaria",
      "Habeas Data Financiero - Ley 1266 de 2008",
      "Ley 'Borrón y Cuenta Nueva' - Ley 2157 de 2021",
      "Política Nacional de IA - CONPES 4144",
    ],
  },
  {
    title: "Gobernanza y Ética",
    isLink: true,
    items: [
      "Políticas de Privacidad y Tratamiento de Datos",
      "Términos de Uso y Licenciamiento Científico",
      "Manual de Mitigación de Sesgos Algorítmicos",
      "Trazabilidad Ontológica y Explicabilidad",
    ],
  },
  {
    title: "Canales Institucionales",
    isLink: false,
    items: [
      "Mesa de Ayuda Técnica: soporte@crediconfianza.co",
      "Atención Cooperativa: +57 (601) 840 2200",
      "Comité de Ética y Auditoría de Datos",
    ],
  },
];

export const footer = {
  brand: "CrediConfianza",
  description:
    "Plataforma científica de auditoría algorítmica y evaluación de riesgo crediticio agropecuario. Sistema de decisión experta para la inclusión financiera rural.",
  location: "San Juan de la Vega, Cundinamarca, Colombia",
  hours: "Horario: Lun - Vie 08:00 a 17:00 COT",
  copyright:
    "© 2024 CrediConfianza. Desarrollo Científico y Modelo de Riesgo Cooperativo. Todos los derechos reservados.",
  version: "Versión del Sistema: 2.4.1-alpha",
  auditBadge: "Auditoría Conforme",
} as const;
