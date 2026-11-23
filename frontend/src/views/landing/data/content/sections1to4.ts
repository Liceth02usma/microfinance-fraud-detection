import type { ArticleSection } from "../types";

/** Secciones 01 – 04 del artículo científico. */
export const sectionsOneToFour: ArticleSection[] = [
  {
    id: "seccion-1",
    anchor: "articulo-resumen",
    dropdownLabel: "01. Resumen y Palabras Clave",
    sidebarLabel: "01. Resumen",
    page: "p. 1",
    title: "01. Resumen y Palabras Clave",
    blocks: [
      {
        kind: "abstract",
        content: {
          segments: [
            { strong: "Resumen:" },
            " La concesión de microcrédito rural enfrenta la paradoja de operar en entornos con alta informalidad documental y transaccional, donde los sistemas tradicionales de detección de fraude basados exclusivamente en machine learning tienden a generar tasas desproporcionadas de falsos positivos en pequeños productores agrícolas. Este trabajo presenta un modelo híbrido tripartito compuesto por un motor de reglas ontológicas (RDFS/OWL), una red bayesiana causal probabilística y un clasificador de gradiente XGBoost optimizado con explicaciones locales SHAP. Evaluado en 38.000 asociados de San Juan de la Vega (Cundinamarca), el artefacto redujo los falsos positivos en 41.2%, mantuvo la paridad ética de impacto dispar en 1.04 y comprimió el tiempo de resolución decisional de 15 días a 48 horas bajo supervisión 100% humana.",
          ],
          keywordsLabel: "Palabras Clave:",
          keywords: [
            "Microcrédito Agropecuario",
            "Inteligencia Artificial Explicable",
            "Redes Bayesianas",
            "Equidad Algorítmica",
            "Ontologías OWL",
          ],
        },
      },
    ],
  },
  {
    id: "seccion-2",
    anchor: "articulo-introduccion",
    dropdownLabel: "02. Introducción y Contexto Rural",
    sidebarLabel: "02. Introducción Territorial",
    page: "p. 2",
    title: "02. Introducción y Contexto Territorial",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          "La provincia de Tequendama y la zona de San Juan de la Vega presentan características socioeconómicas particulares donde conviven cultivos de café, plátano, caña panelera y ganadería de doble propósito. En esta región, más del 65% de las transacciones se efectúan en efectivo y la tenencia de la tierra involucra sucesiones familiares no formalizadas mediante escritura pública.",
        ],
      },
      {
        kind: "stat-cards",
        variant: "context",
        items: [
          {
            label: "Contexto Territorial: San Juan de la Vega (Cundinamarca)",
            value: "14 Oficinas (7 Rurales)",
            body: "El 73% de los microempresarios de la zona carece de facturación electrónica Dian y comercializa directamente en centrales mayoristas o plazas locales. Las entidades bancarias comerciales rechazan o demoran indebidamente el 42% de estas solicitudes por falta de soportes contables urbanos, confundiéndolos con fraudes de solvencia ficticia.",
          },
        ],
      },
    ],
  },
  {
    id: "seccion-3",
    anchor: "articulo-problema",
    dropdownLabel: "03. Planteamiento del Problema",
    sidebarLabel: "03. Planteamiento Problema",
    page: "p. 3",
    title: "03. Planteamiento del Problema",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          "Los algoritmos estándar de scoring crediticio presentan dos fallas críticas en entornos rurales: ",
          { em: "falsos rechazos masivos" },
          " y ",
          { em: "dilación operativa" },
          ".",
        ],
      },
      {
        kind: "stat-cards",
        variant: "issue",
        items: [
          {
            label: "Asimetría de Falsos Positivos",
            accent: "risk-high",
            value: "41.2% Brecha",
            body: "Los solicitantes de veredas sufren una tasa de falsos positivos 2.4 veces superior a la de solicitantes urbanos por carecer de línea telefónica fija y cuenta bancaria comercial.",
          },
          {
            label: "Latencia en Verificación Manual",
            accent: "risk-medium",
            value: "15 Días Hábiles",
            body: "Los comités tardaban semanas en enviar peritos a campo para corroborar si la falta de local comercial era fraude o práctica agrícola legítima.",
          },
        ],
      },
    ],
  },
  {
    id: "seccion-4",
    anchor: "articulo-justificacion",
    dropdownLabel: "04. Justificación Social y Técnica",
    sidebarLabel: "04. Justificación Social",
    page: "p. 4",
    title: "04. Justificación Social y Técnica",
    blocks: [
      {
        kind: "quote",
        text: "«La exclusión algorítmica involuntaria del campesino reproduce brechas de pobreza que las cooperativas solidarias están mandatadas a disolver. Un algoritmo sin contexto ontológico es ciego a la lógica productiva de la tierra.»",
        cite: "— Comité Científico de Ética y Auditoría de Datos, CrediConfianza",
      },
    ],
  },
];
