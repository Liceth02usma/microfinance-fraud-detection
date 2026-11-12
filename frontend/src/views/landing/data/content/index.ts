import type { ArticleHeader, ArticleSection } from "../types";
import { sectionsFiveToEight } from "./sections5to8";
import { sectionsNineToTwelve } from "./sections9to12";
import { sectionsOneToFour } from "./sections1to4";

/** Cabecera editorial del visor del artículo. */
export const articleHeader: ArticleHeader = {
  kicker: "Artículo de Investigación Aplicada • ABPr & DSR",
  title: "Arquitectura Híbrida Explicable para la Detección de Fraude en Microfinanzas Rurales",
  meta: [
    { icon: "corporate_fare", text: "Cooperativa CrediConfianza" },
    { icon: "calendar_today", text: "Octubre 2024" },
    { icon: "verified", text: "DOI: 10.1016/j.agrifin.2024.10892" },
  ],
};

/** Las 12 secciones del artículo, en orden de aparición. */
export const articleSections: ArticleSection[] = [
  ...sectionsOneToFour,
  ...sectionsFiveToEight,
  ...sectionsNineToTwelve,
];
