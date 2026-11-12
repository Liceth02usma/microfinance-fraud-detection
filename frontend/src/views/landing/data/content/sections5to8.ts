import type { ArticleSection } from "../types";

/** Secciones 05 – 08 del artículo científico. */
export const sectionsFiveToEight: ArticleSection[] = [
  {
    id: "seccion-5",
    anchor: "articulo-objetivos",
    dropdownLabel: "05. Objetivos General y Específicos",
    sidebarLabel: "05. Objetivos",
    page: "p. 5",
    title: "05. Objetivos General y Específicos",
    blocks: [
      {
        kind: "paragraph",
        muted: true,
        segments: [
          {
            strong:
              "Definición formal de los alcances técnicos, algorítmicos y socio-jurídicos del artefacto socio-técnico.",
          },
        ],
      },
      {
        kind: "highlight-card",
        title: "Objetivo General",
        body: "Diseñar, formalizar y validar empíricamente un prototipo híbrido explicable de detección de fraude en microfinanzas rurales, que articule ontologías de dominio (OWL), actualización bayesiana causal y algoritmos de gradiente (XGBoost), garantizando auditoría ética, paridad demográfica y supervisión colegiada humana en la cooperativa CrediConfianza (San Juan de la Vega, Cundinamarca).",
      },
      {
        kind: "numbered-cards",
        items: [
          {
            index: "1",
            title: "1. Representación & Ontología",
            body: "Modelar formalmente el conocimiento experto mediante una ontología de riesgo en OWL, reglas contextualizadas con topes para señales débiles y red bayesiana de verificabilidad.",
          },
          {
            index: "2",
            title: "2. Aprendizaje Automático & SHAP",
            body: "Calibrar un ensamble XGBoost con regularización y aislamiento de atributos sensibles, generando atribuciones locales SHAP por alerta integradas en el puntaje de fusión.",
          },
          {
            index: "3",
            title: "3. Evaluación de Paridad & Gobierno",
            body: "Auditar empíricamente el desempeño (AUC, F1), la razón FPR rural/urbano (0.80 - 1.25) y formalizar el manual de gobierno bajo Hábeas Data (Ley 2157).",
          },
        ],
      },
    ],
  },
  {
    id: "seccion-6",
    anchor: "articulo-marco-teorico",
    dropdownLabel: "06. Marco Teórico (MYCIN, Ontologías, Bayes)",
    sidebarLabel: "06. Formulación Bayesiana",
    page: "p. 6",
    title: "06. Marco Teórico y Formulación Bayesiana",
    blocks: [
      {
        kind: "paragraph",
        muted: true,
        segments: [
          "Formalización causal inspirada en MYCIN y redes bayesianas actualizadas mediante factores de verosimilitud (Likelihood Ratios, LR) condicionados por el entorno agropecuario.",
        ],
      },
      {
        kind: "formula",
        content: {
          title: "Formulación Matemática Causal",
          badge: "Inferencia Bayesiana",
          expressions: [
            "Odds(Fraude | Evidencia) = Odds_previos × ∏ LR_i",
            "P(Fraude | Evidencia) = Odds(Fraude | Evidencia) / [ 1 + Odds(Fraude | Evidencia) ]",
          ],
          terms: [
            {
              label: "Odds Previos",
              formula: "P(F) / [1 - P(F)]",
              note: "Frecuencia base histórica cooperativa (prior odds = 0.08 / 0.92 = 0.087).",
            },
            {
              label: "Razón de Verosimilitud",
              formula: "LR_i = P(s|F) / P(s|¬F, contexto)",
              note: "Condicionada dinámicamente según geografía y actividad del asociado.",
            },
            {
              label: "Odds Posteriores",
              formula: "P(F | E) Normalizada",
              note: "Probabilidad corregida que mitiga correlaciones espurias del entorno informal.",
            },
          ],
          table: {
            caption: "Tabla 3: Modulación Territorial de la Razón de Verosimilitud (LR)",
            columns: ["Evidencia", "Contexto territorial", "LR", "Efecto sobre las odds previas"],
            rows: [
              [
                "Cédula verificada en Registraduría",
                "Rural y urbano",
                "0.30",
                "Reduce las odds de fraude (evidencia en contra)",
              ],
              [
                "Cédula cancelada o inconsistente",
                "Rural y urbano",
                "4.50",
                "Multiplica las odds de fraude por 4.5",
              ],
              [
                "Inconsistencia entre ingresos y capacidad predial",
                "Rural y urbano",
                "6.00",
                "Fuerte evidencia a favor del fraude",
              ],
              [
                "Ingresos coherentes con la actividad declarada",
                "Rural y urbano",
                "0.40",
                "Reduce las odds de fraude (coherencia productiva)",
              ],
              [
                "Sin local fijo, con venta en plaza o feria",
                "Rural agropecuario",
                "1.05",
                "Casi neutral: la informalidad no implica fraude",
              ],
              [
                "Sin local fijo y sin venta en plaza",
                "Urbano comerciante",
                "2.50",
                "Señal moderada a favor del fraude",
              ],
              [
                "Con local fijo y matrícula mercantil",
                "Rural y urbano",
                "0.80",
                "Evidencia de solvencia operativa",
              ],
            ],
          },
        },
      },
    ],
  },
  {
    id: "seccion-7",
    anchor: "articulo-marco-legal",
    dropdownLabel: "07. Marco Legal Colombiano",
    sidebarLabel: "07. Marco Legal Colombiano",
    page: "p. 7",
    title: "07. Marco Legal Colombiano",
    blocks: [
      {
        kind: "cards",
        variant: "legal",
        items: [
          {
            title: "Ley 1266 de 2008 & Ley 2157 de 2021",
            body: "Habeas Data financiero. Derecho a la actualización y rectificación inmediata ante falsos reportes y derecho a la explicación sin cajas negras automáticas.",
          },
          {
            title: "Ley 1581 de 2012",
            body: "Régimen general de protección de datos personales. Exige consentimiento expreso para perfilamiento predictivo algorítmico y geolocalización.",
          },
          {
            title: "Circular Básica Jurídica 22/2020 Supersolidaria",
            body: "Instrucciones de gestión de riesgo crediticio (SARC) obligando a comités humanos documentados para montos microfinancieros.",
          },
          {
            title: "CONPES 4144 (2024)",
            body: "Política Nacional de Inteligencia Artificial para Colombia. Principios vinculantes de equidad, no discriminación de género y auditabilidad.",
          },
        ],
      },
    ],
  },
  {
    id: "seccion-8",
    anchor: "articulo-metodologia",
    dropdownLabel: "08. Metodología ABPr y DSR",
    sidebarLabel: "08. Metodología ABPr & DSR",
    page: "p. 8",
    title: "08. Metodología ABPr y DSR",
    blocks: [
      {
        kind: "paragraph",
        muted: true,
        segments: [
          "La investigación se desarrolló bajo el paradigma de ",
          { em: "Design Science Research" },
          " (DSR) complementado con ",
          { em: "Aprendizaje Basado en Proyectos" },
          " (ABPr) estructurado en 6 fases secuenciales:",
        ],
      },
      {
        kind: "steps",
        items: [
          {
            index: "1",
            title: "Diagnóstico Territorial:",
            body: "Inmersión con 14 oficiales de crédito en San Juan de la Vega para documentar tipologías de informalidad campesina.",
          },
          {
            index: "2",
            title: "Ingeniería Ontológica:",
            body: "Codificación en Protégé de conceptos RDFS/OWL que formalizan la tenencia comunal y ciclos de siembra.",
          },
          {
            index: "3",
            title: "Modelado Causal:",
            body: "Especificación de la Red Bayesiana y calibración de verosimilitudes con expertos de la cooperativa.",
          },
          {
            index: "4",
            title: "Entrenamiento y Calibración:",
            body: "Ajuste de XGBoost con isotonic regression para eliminar sesgos de sobreconfianza en scores.",
          },
          {
            index: "5",
            title: "Pruebas de Ablación:",
            body: "Validación experimental cuantitativa deshabilitando componentes aislados del pipeline.",
          },
          {
            index: "6",
            title: "Gobernanza Socio-Técnica:",
            body: "Implantación del protocolo decisional humano y auditoría continua de paridad.",
          },
        ],
      },
    ],
  },
];
