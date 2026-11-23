/**
 * Modelo de datos de la landing page de CrediConfianza.
 *
 * El contenido del artículo científico se almacena como datos tipados (y no como
 * JSX) por tres razones: (1) el copy es un artefacto auditable que debe poder
 * revisarse sin leer componentes, (2) el mismo contenido alimenta el índice
 * lateral, el desplegable del encabezado y el visor, y (3) los bloques se
 * renderizan mediante un conjunto pequeño de componentes testeables.
 */

/** Segmentos en línea admisibles dentro de un párrafo del artículo. */
export type InlineSegment = string | { strong: string } | { em: string } | { mono: string };

/** Tonos disponibles para las insignias de las tarjetas. */
export type BadgeTone = "brand" | "risk-low" | "bias" | "trust" | "muted";

/** Acentos de etiqueta en las tarjetas de métrica. */
export type CardAccent = "secondary" | "risk-high" | "risk-medium";

export interface Badge {
  text: string;
  tone: BadgeTone;
}

/** Tarjeta con métrica destacada (contexto territorial, problemáticas). */
export interface StatCardItem {
  label: string;
  value: string;
  body: string;
  /** Color de la etiqueta; por defecto el propio de la variante. */
  accent?: CardAccent;
}

/** Tarjeta con título, cuerpo e insignia opcional (conclusiones, marco legal). */
export interface CardItem {
  title: string;
  body: string;
  badge?: Badge;
}

/** Tarjeta numerada con círculo e encabezado (objetivos específicos). */
export interface NumberedCardItem {
  index: string;
  title: string;
  body: string;
}

/** Tabla científica (B1 de reglas, ablación, modulación de LR). */
export interface ArticleTable {
  caption?: string;
  columns: string[];
  rows: string[][];
  /** Resalta la última fila (configuración ganadora / estado conforme). */
  emphasizeLastRow?: boolean;
}

/** Término de la formulación bayesiana. */
export interface FormulaTerm {
  label: string;
  formula: string;
  note: string;
}

/** Panel de formulación matemática causal (sección 06). */
export interface FormulaBlock {
  title: string;
  badge: string;
  expressions: string[];
  terms: FormulaTerm[];
  table: ArticleTable;
}

/** Resumen ejecutable con palabras clave (sección 01). */
export interface AbstractBlock {
  segments: InlineSegment[];
  keywordsLabel: string;
  keywords: string[];
}

/** Medidor de paridad FPR rural/urbano (sección 11). */
export interface ParityMeterBlock {
  intro: string;
  /** Razón FPR rural/urbano medida (p. ej. 1.04). */
  value: number;
  /** Límites de la escala mostrada. */
  min: number;
  max: number;
  /** Zona ética aceptable (regla del 80%: 0.80 – 1.25). */
  lower: number;
  upper: number;
  verdict: string;
  leftLabel: string;
  rightLabel: string;
}

/** Bloques de contenido del artículo. */
export type ArticleBlock =
  | { kind: "abstract"; content: AbstractBlock }
  | { kind: "paragraph"; segments: InlineSegment[]; muted?: boolean }
  | { kind: "stat-cards"; variant: "context" | "issue"; items: StatCardItem[] }
  | { kind: "quote"; text: string; cite: string }
  | { kind: "highlight-card"; title: string; body: string }
  | { kind: "cards"; variant: "legal" | "conclusion"; items: CardItem[] }
  | { kind: "numbered-cards"; items: NumberedCardItem[] }
  | { kind: "steps"; items: NumberedCardItem[] }
  | { kind: "formula"; content: FormulaBlock }
  | { kind: "table"; table: ArticleTable }
  | { kind: "parity-meter"; content: ParityMeterBlock };

/** Sección del artículo científico (una de las 12). */
export interface ArticleSection {
  /** Ancla del índice lateral: `#seccion-N` apunta al título. */
  id: string;
  /** Ancla del desplegable del encabezado: `#articulo-*`. */
  anchor: string;
  /** Etiqueta del desplegable "Artículo Científico". */
  dropdownLabel: string;
  /** Etiqueta del índice temático lateral. */
  sidebarLabel: string;
  /** Paginación mostrada en el índice lateral. */
  page: string;
  /** Encabezado visible de la sección. */
  title: string;
  blocks: ArticleBlock[];
}

/** Cabecera del visor del artículo. */
export interface ArticleHeader {
  kicker: string;
  title: string;
  meta: { icon: string; text: string }[];
}
