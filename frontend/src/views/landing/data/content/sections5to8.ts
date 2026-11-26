import { metrics, num } from "../../../../data/metrics";
import type { ArticleSection } from "../types";

const priorRural = metrics.bayes.prior_rural;
const priorUrbana = metrics.bayes.prior_urbana;
const odds = (p: number): string => num(p / (1 - p), 3);

/** Efecto de una razón de verosimilitud sobre las odds de fraude. */
function lrEffect(lr: number | null): string {
  if (lr === null) return "n/d";
  if (lr >= 10) return "Evidencia fuerte a favor del fraude";
  if (lr >= 1.3) return "Evidencia débil a favor del fraude";
  if (lr > 0.77) return "Casi neutral: no cambia la probabilidad";
  return "Evidencia en contra del fraude";
}

const WEAK_SHOWN = [
  "celular_prepago",
  "sin_cuenta_bancaria",
  "sin_historial",
  "vive_lejos",
  "factura_manual",
  "direccion_sin_georreferenciar",
];
const lrRows: string[][] = [
  ...metrics.bayes.likelihood_ratios
    .filter((r) => r.kind === "fuerte")
    .slice(0, 3)
    .map((r) => [
      r.label,
      "Indicio fuerte",
      num(r.lr_rural, 1),
      num(r.lr_urbana, 1),
      lrEffect(r.lr_rural),
    ]),
  ...metrics.bayes.likelihood_ratios
    .filter((r) => WEAK_SHOWN.includes(r.signal))
    .map((r) => [
      r.label,
      "Señal débil",
      num(r.lr_rural, 2),
      num(r.lr_urbana, 2),
      `Rural: ${lrEffect(r.lr_rural).toLowerCase()}`,
    ]),
];

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
        body: "Diseñar y validar con datos sintéticos un prototipo híbrido y explicable de detección de fraude para CrediConfianza que combine reglas expertas, una red bayesiana y un modelo de aprendizaje automático, mida la paridad entre grupos y deje la decisión final en manos de un analista.",
      },
      {
        kind: "numbered-cards",
        items: [
          {
            index: "1",
            title: "1. Representación & Ontología",
            body: "Estructurar el conocimiento experto en una matriz de adquisición, una ontología del dominio y 24 reglas con topes y salvaguardas para las señales débiles rurales.",
          },
          {
            index: "2",
            title: "2. Aprendizaje Automático & SHAP",
            body: "Entrenar y calibrar un XGBoost que excluye las variables protegidas, con explicaciones SHAP por alerta, y fusionarlo con las reglas y la red bayesiana en un puntaje de 0 a 100.",
          },
          {
            index: "3",
            title: "3. Evaluación de Paridad & Gobierno",
            body: "Medir AUC, F1, precisión, recall, falsos positivos por grupo y paridad (fairlearn), y registrar cada decisión humana con su motivo y la versión del modelo.",
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
          "La red bayesiana (pgmpy) actualiza la probabilidad de fraude con cada evidencia. Las probabilidades condicionales se estimaron del dataset sintético de entrenamiento y dependen de la zona, de modo que una señal habitual en el campo casi no mueve el resultado.",
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
              note: `Tasa base de fraude del dataset: ${num(priorRural * 100, 2)} % rural (odds ${odds(priorRural)}) y ${num(priorUrbana * 100, 2)} % urbana (odds ${odds(priorUrbana)}).`,
            },
            {
              label: "Razón de Verosimilitud",
              formula: "LR_i = P(s | F, zona) / P(s | ¬F, zona)",
              note: "Calculada con las tablas de probabilidad de la red, por separado para zona rural y urbana.",
            },
            {
              label: "Odds Posteriores",
              formula: "P(F | E) Normalizada",
              note: "Probabilidad de fraude que entrega la red y entra a la fusión con su peso.",
            },
          ],
          table: {
            caption:
              "Tabla 3: Razones de verosimilitud (LR) calculadas de la red bayesiana, por zona",
            columns: ["Evidencia", "Tipo", "LR rural", "LR urbana", "Efecto sobre las odds"],
            rows: lrRows,
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
            title: "CONPES 4144 (2025)",
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
            title: "Adquisición del conocimiento:",
            body: "Análisis del enunciado, lista de chequeo de analistas y dos entrevistas simuladas, registradas en la matriz de adquisición con fuente y nivel de confianza.",
          },
          {
            index: "2",
            title: "Representación del conocimiento:",
            body: "Ontología del dominio en JSON (Solicitante, Negocio, Señal, Regla, Decisión…) y 24 reglas en YAML validadas contra un esquema.",
          },
          {
            index: "3",
            title: "Red bayesiana:",
            body: "Estructura definida a partir del conocimiento experto y probabilidades estimadas del dataset sintético de entrenamiento.",
          },
          {
            index: "4",
            title: "Aprendizaje automático:",
            body: "XGBoost calibrado con el método sigmoide en validación cruzada de 5 particiones, comparado con una regresión logística base.",
          },
          {
            index: "5",
            title: "Validación y ablación:",
            body: "Comparación de cada motor por separado, de la fusión y de una lista de chequeo simulada sobre el split de prueba, con pruebas automáticas de los casos de referencia.",
          },
          {
            index: "6",
            title: "Gobierno del sistema:",
            body: "Registro de cada decisión del analista con motivo y versión del modelo, y auditoría de paridad por zona, género y pertenencia étnica.",
          },
        ],
      },
    ],
  },
];
