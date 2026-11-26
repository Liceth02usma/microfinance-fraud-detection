import { checklist, hybrid, metrics, num, pct } from "../../../../data/metrics";
import type { ArticleSection } from "../types";

const rr = metrics.review_rates_legit;
const fpChecklist = metrics.headline.false_positives_checklist.toLocaleString("es-CO");
const fpHybrid = metrics.headline.false_positives_hybrid.toLocaleString("es-CO");

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
            ` En el microcrédito rural, las listas de chequeo tratan como sospechosas señales que son normales en el campo (no tener cuenta bancaria, usar celular prepago, vender en plazas), lo que genera falsos positivos y demoras para solicitantes legítimos. Este trabajo presenta un prototipo híbrido que combina 24 reglas expertas con salvaguardas rurales, una red bayesiana y un modelo XGBoost calibrado con explicaciones SHAP, fusionados en un puntaje de riesgo de 0 a 100 con semáforo. Sobre ${metrics.test_split.n.toLocaleString("es-CO")} solicitudes sintéticas de prueba, el sistema obtuvo AUC ${num(hybrid.auc)}, precisión ${num(hybrid.precision)}, recall ${num(hybrid.recall)} y F1 ${num(hybrid.f1)}. Frente a una lista de chequeo simulada, los falsos positivos bajaron de ${fpChecklist} a ${fpHybrid} y la proporción de solicitantes rurales legítimos enviados a revisión pasó de ${pct(rr.checklist_rural)} a ${pct(rr.hybrid_rural)}. El sistema solo recomienda: cada decisión la toma y la justifica un analista.`,
          ],
          keywordsLabel: "Palabras Clave:",
          keywords: [
            "Microcrédito agropecuario",
            "Inteligencia artificial explicable",
            "Redes bayesianas",
            "Equidad algorítmica",
            "Sistemas expertos",
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
          "CrediConfianza es una cooperativa de ahorro y crédito de San Juan de la Vega, creada en 1989 como fondo parroquial para pequeños caficultores. Hoy atiende a 38.000 asociados en 14 oficinas, con una cartera cercana a 42.000 millones de pesos en consumo, microempresa, vivienda y crédito agropecuario. La detección de fraude se hace a mano, con listas de chequeo y la experiencia de los analistas.",
        ],
      },
      {
        kind: "stat-cards",
        variant: "context",
        items: [
          {
            label: "Contexto del caso (enunciado del proyecto)",
            value: "14 oficinas (7 rurales)",
            body: "El estudio manual tarda entre 5 y 8 días hábiles en zona urbana y entre 10 y 15 en zona rural, por la distancia, la conectividad intermitente y la falta de comprobantes formales de ingresos. En temporada de cosecha la cola supera las tres semanas.",
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
          "Aplicadas sin contexto, las señales débiles castigan la ruralidad: ",
          { em: "falsos positivos" },
          " para productores legítimos y ",
          { em: "demoras" },
          " por exigencias documentales adicionales. Pregunta orientadora: ¿cómo combinar reglas expertas, razonamiento probabilístico y aprendizaje automático para detectar fraude manteniendo transparencia, equidad y responsabilidad?",
        ],
      },
      {
        kind: "stat-cards",
        variant: "issue",
        items: [
          {
            label: "Falsos positivos de una lista de chequeo (simulada)",
            accent: "risk-high",
            value: `${pct(checklist.fpr_rural)} rural · ${pct(checklist.fpr_urbana)} urbano`,
            body: `Si se marca como sospechoso a quien tenga 3 o más señales débiles, en el dataset sintético quedan marcados ${pct(checklist.fpr_rural)} de los rurales legítimos y ${pct(checklist.fpr_urbana)} de los urbanos legítimos. Es una simulación del proceso actual, no una medición en la cooperativa.`,
          },
          {
            label: "Demora del estudio manual rural",
            accent: "risk-medium",
            value: "10 a 15 días hábiles",
            body: "Según el enunciado del caso, frente a 5 a 8 días en zona urbana. Verificar referencias y visitar la parcela es lo que más tiempo consume.",
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
        text: "«Manejar efectivo, vender en ferias, tener ingresos por cosecha o no tener historial bancario no es fraude. Un sistema que no distingue esa realidad excluye de hecho a quienes la cooperativa existe para atender.»",
        cite: "— Síntesis del planteamiento del proyecto",
      },
      {
        kind: "paragraph",
        segments: [
          "Un sistema que explique cada alerta, mida la equidad entre grupos y deje la decisión en manos de un analista reduce la exclusión sin renunciar a detectar el fraude real, y deja trazabilidad para la auditoría y el cumplimiento del marco legal.",
        ],
      },
    ],
  },
];
