import { generatedOn, metrics } from "../../../../data/metrics";
import type { ArticleHeader, ArticleSection } from "../types";
import { sectionsFiveToEight } from "./sections5to8";
import { sectionsNineToTwelve } from "./sections9to12";
import { sectionsOneToFour } from "./sections1to4";

/** Cabecera editorial del visor del artículo. */
export const articleHeader: ArticleHeader = {
  kicker: "Informe del proyecto • Ingeniería del conocimiento",
  title: "Arquitectura Híbrida Explicable para la Detección de Fraude en Microfinanzas Rurales",
  meta: [
    { icon: "corporate_fare", text: "Cooperativa CrediConfianza" },
    { icon: "calendar_today", text: `Resultados del ${generatedOn}` },
    { icon: "dataset", text: "Datos sintéticos" },
    { icon: "memory", text: `Modelo ${metrics.model_version}` },
  ],
};

/** Las 12 secciones del artículo, en orden de aparición. */
export const articleSections: ArticleSection[] = [
  ...sectionsOneToFour,
  ...sectionsFiveToEight,
  ...sectionsNineToTwelve,
];
