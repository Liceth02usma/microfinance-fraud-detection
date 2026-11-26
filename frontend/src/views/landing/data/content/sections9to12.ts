import {
  ablation,
  checklist,
  fprRural,
  fprUrbana,
  hybrid,
  metrics,
  num,
  pct,
  zonaParity,
} from "../../../../data/metrics";
import type { ArticleSection } from "../types";

const CATEGORY_LABEL: Record<string, string> = {
  fuerte: "Fuerte",
  debil: "Débil",
  salvaguarda: "Salvaguarda",
  bias: "Auditoría",
};

const byCat = metrics.rules.by_category as Record<string, number>;

const ruleRows: string[][] = metrics.rules.examples.map((r) => [
  CATEGORY_LABEL[r.categoria] ?? r.categoria,
  r.id,
  r.condicion.replace(/^SI\s+/, ""),
  `${r.peso > 0 ? "+" : ""}${num(r.peso, 2)}`,
  r.justificacion,
]);

const ablationRows: string[][] = ablation.map((c) => [
  c.name,
  c.auc === null ? "—" : num(c.auc),
  num(c.precision),
  num(c.recall),
  num(c.f1),
  pct(c.fpr_rural, 2),
  pct(c.fpr_urbana, 2),
]);

// Regla del 80 %: razón de tasas de selección (alertas) entre grupos.
const rates = (zonaParity?.selection_rates ?? {}) as Record<string, number>;
const selectionRatio =
  rates.rural !== undefined && rates.urbana ? rates.rural / rates.urbana : null;
const withinBand = selectionRatio !== null && selectionRatio >= 0.8 && selectionRatio <= 1.25;

const groupLabel: Record<string, string> = {
  tipo_zona: "Zona",
  genero: "Género",
  pertenencia_etnica: "Pertenencia étnica",
};

const fprRows: string[][] = metrics.audit.fpr_by_group.map((g) => [
  groupLabel[g.attribute] ?? g.attribute,
  g.group,
  g.n_samples.toLocaleString("es-CO"),
  String(g.n_false_positives),
  pct(g.fpr, 2),
  `${pct(g.fpr_ci_low, 2)} – ${pct(g.fpr_ci_high, 2)}`,
]);

const rr = metrics.review_rates_legit;
const w = metrics.fusion.weights;

/** Secciones 09 – 12 del artículo científico. */
export const sectionsNineToTwelve: ArticleSection[] = [
  {
    id: "seccion-9",
    anchor: "articulo-desarrollo",
    dropdownLabel: "09. Desarrollo del Artefacto",
    sidebarLabel: "09. Tabla B1 de Reglas",
    page: "p. 9",
    title: "09. Desarrollo del Artefacto y Tabla B1 de Reglas",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          `La base de reglas (versión ${metrics.rules.version}) tiene ${metrics.rules.total} reglas: ${byCat.debil ?? 0} de señales débiles, ${byCat.fuerte ?? 0} de indicios fuertes, ${byCat.salvaguarda ?? 0} salvaguardas de equidad y ${byCat.bias ?? 0} de auditoría. La fusión pondera reglas (${num(w.rules, 2)}), red bayesiana (${num(w.bayesian, 2)}) y XGBoost (${num(w.ml, 2)}); un puntaje menor a ${metrics.fusion.verde_max} es verde y desde ${metrics.fusion.amarillo_max} es rojo. Un indicio fuerte nunca queda en verde y dos o más llevan a rojo. La Tabla B1 muestra reglas representativas tal como están en `,
          { mono: "knowledge/reglas.yaml" },
          ":",
        ],
      },
      {
        kind: "table",
        table: {
          caption: "Tabla B1: Reglas representativas de la base de conocimiento",
          columns: ["Categoría", "Identificador", "Condición", "Peso", "Justificación"],
          rows: ruleRows,
        },
      },
    ],
  },
  {
    id: "seccion-10",
    anchor: "articulo-resultados",
    dropdownLabel: "10. Resultados y Pruebas Ablación",
    sidebarLabel: "10. Pruebas de Ablación",
    page: "p. 10",
    title: "10. Resultados Empíricos y Pruebas de Ablación",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          `Evaluación sobre ${metrics.test_split.n.toLocaleString("es-CO")} solicitudes sintéticas del split de prueba (${metrics.test_split.n_fraud} fraudes, ${metrics.test_split.n_rural.toLocaleString("es-CO")} rurales). Para los motores individuales, la alerta es un puntaje de 0,5 o más; para el sistema híbrido, el semáforo rojo. La lista de chequeo marca a quien tenga 3 o más señales débiles o algún indicio fuerte.`,
        ],
      },
      {
        kind: "table",
        table: {
          caption: "Tabla 4: Comparación de configuraciones (ablación)",
          columns: ["Configuración", "AUC", "Precisión", "Recall", "F1", "FPR rural", "FPR urbana"],
          rows: ablationRows,
          emphasizeLastRow: true,
        },
      },
      {
        kind: "paragraph",
        segments: [
          `El sistema híbrido combina la precisión de la red bayesiana (${num(ablation[2]?.precision)}) con la explicación por reglas y SHAP. Además, solo ${pct(rr.hybrid_rural)} de los rurales legítimos y ${pct(rr.hybrid_urbana)} de los urbanos legítimos quedan en amarillo o rojo, frente a ${pct(rr.checklist_rural)} y ${pct(rr.checklist_urbana)} con la lista de chequeo. `,
          { strong: "Limitación:" },
          " en el generador sintético el fraude depende sobre todo de los indicios fuertes, por eso todos los motores alcanzan un AUC casi perfecto. Con datos reales se espera un desempeño menor.",
        ],
      },
    ],
  },
  {
    id: "seccion-11",
    anchor: "articulo-discusion",
    dropdownLabel: "11. Discusión, Sesgos y Límites",
    sidebarLabel: "11. Discusión y Paridad",
    page: "p. 11",
    title: "11. Discusión Ética, Sesgos y Tabla 5 de Paridad",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          "La regla del 80 % compara la tasa de alertas entre grupos: una razón entre 0,80 y 1,25 se considera paritaria. Las variables protegidas (zona, género, pertenencia étnica) no entran al modelo ML; se usan solo para auditar.",
        ],
      },
      {
        kind: "parity-meter",
        content: {
          intro: `Razón de alertas rural / urbana = ${num(selectionRatio, 2)}`,
          ariaLabel: "Razón de tasas de alerta entre zona rural y urbana",
          value: selectionRatio ?? 0,
          min: 0.5,
          max: 1.5,
          lower: 0.8,
          upper: 1.25,
          verdict: withinBand ? "Dentro del rango paritario" : "Fuera del rango paritario",
          leftLabel: "0,50 (más alertas urbanas)",
          rightLabel: "1,50 (más alertas rurales)",
        },
      },
      {
        kind: "paragraph",
        segments: [
          `Falsos positivos (alerta roja a un legítimo): ${fprRural?.n_false_positives ?? 0} rurales (${pct(fprRural?.fpr, 2)}) y ${fprUrbana?.n_false_positives ?? 0} urbanos (${pct(fprUrbana?.fpr, 2)}). Con tan pocos casos, la razón de tasas no es estable, por eso la Tabla 5 incluye intervalos de confianza de Wilson. Diferencia de paridad demográfica por zona: ${num(zonaParity?.demographic_parity_difference, 4)}; diferencia de Equalized Odds: ${num(zonaParity?.equalized_odds_difference, 4)}.`,
        ],
      },
      {
        kind: "table",
        table: {
          caption: "Tabla 5: Tasa de falsos positivos por grupo (IC 95 % de Wilson)",
          columns: ["Variable", "Grupo", "n", "FP", "FPR", "IC 95 %"],
          rows: fprRows,
        },
      },
    ],
  },
  {
    id: "seccion-12",
    anchor: "articulo-conclusiones",
    dropdownLabel: "12. Conclusiones y Gobierno",
    sidebarLabel: "12. Conclusiones",
    page: "p. 12",
    title: "12. Conclusiones y Recomendaciones del Estudio",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          "Con datos sintéticos, el prototipo muestra que combinar reglas con salvaguardas rurales, una red bayesiana condicionada por zona y un modelo ML sin variables protegidas detecta el fraude sin castigar las señales propias de la economía campesina. Los resultados validan el diseño; su desempeño real debe medirse con datos anonimizados de la cooperativa.",
        ],
      },
      {
        kind: "cards",
        variant: "conclusion",
        items: [
          {
            title: "1. Fusión de tres motores",
            badge: { text: `F1 ${num(hybrid.f1)}`, tone: "brand" },
            body: `La fusión ponderada (reglas ${num(w.rules, 2)}, bayes ${num(w.bayesian, 2)}, ML ${num(w.ml, 2)}) obtuvo precisión ${num(hybrid.precision)} y recall ${num(hybrid.recall)}, y cada alerta trae al menos tres factores explicativos.`,
          },
          {
            title: "2. Menos falsos positivos",
            badge: { text: "Equidad", tone: "risk-low" },
            body: `Frente a la lista de chequeo simulada, los falsos positivos bajaron de ${metrics.headline.false_positives_checklist.toLocaleString("es-CO")} a ${metrics.headline.false_positives_hybrid} y el FPR rural pasó de ${pct(checklist.fpr_rural)} a ${pct(hybrid.fpr_rural, 2)}.`,
          },
          {
            title: "3. Paridad medida, no supuesta",
            badge: { text: `Razón ${num(selectionRatio, 2)}`, tone: "bias" },
            body: "La auditoría calcula falsos positivos por zona, género y pertenencia étnica con intervalos de confianza. Los grupos pequeños (género «otro», indígenas) requieren más datos antes de sacar conclusiones.",
          },
          {
            title: "4. Decisión humana registrada",
            badge: { text: "Analista decide", tone: "trust" },
            body: "El sistema no rechaza a nadie de forma automática. Cada valoración guarda la decisión del analista, su motivo, si se apartó de la recomendación y la versión del modelo.",
          },
        ],
      },
    ],
  },
];
