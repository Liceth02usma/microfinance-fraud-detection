import type { ArticleSection } from "../types";

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
          "La Tabla B1 categoriza las señales de alerta de acuerdo con su poder confirmatorio y sus factores mitigantes:",
        ],
      },
      {
        kind: "table",
        table: {
          columns: [
            "Categoría",
            "Identificador",
            "Condición Lógica",
            "Ponderación",
            "Acción Mitigadora",
          ],
          rows: [
            [
              "Fuerte",
              "R_F01",
              "Cédula reportada en BD Registraduría como cancelada o inconsistente",
              "+0.40",
              "Bloqueo Preventivo",
            ],
            [
              "Fuerte",
              "R_F02",
              "Inconsistencia grave entre ingresos declarados y capacidad física predial",
              "+0.30",
              "Auditoría Presencial",
            ],
            [
              "Débil",
              "R_D01",
              "Ausencia de local comercial fijo o establecimiento con matrícula mercantil",
              "+0.03",
              "Mitigado por Venta Plaza (-50%)",
            ],
            [
              "Débil",
              "R_D02",
              "Facturación o recibos manuales en talonario informal",
              "+0.03",
              "Mitigado por Ciclo Cosecha",
            ],
            [
              "Débil",
              "R_D03",
              "Línea móvil prepago sin plan pospago registrado",
              "+0.03",
              "Tope Acumulado Débiles: 0.10",
            ],
          ],
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
          "Las pruebas con 4.200 expedientes reales validados contrastan el modelo aislado frente a la arquitectura completa:",
        ],
      },
      {
        kind: "table",
        table: {
          columns: [
            "Configuración Evaluada",
            "Precision",
            "Recall",
            "F1-Score",
            "FPR Rural",
            "Impacto Dispar",
          ],
          rows: [
            [
              "Solo XGBoost (Línea Base Urbana)",
              "0.742",
              "0.890",
              "0.809",
              "18.4%",
              "2.14 (Sesgado)",
            ],
            ["Reglas + XGBoost (Sin Bayes)", "0.810", "0.885", "0.845", "14.1%", "1.56"],
            ["Arquitectura Híbrida Completa", "0.891", "0.878", "0.884", "6.8%", "1.04 (Conforme)"],
          ],
          emphasizeLastRow: true,
        },
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
          "De conformidad con los estándares internacionales de Fairness de la IEEE y el CONPES 4144, la paridad estadística de falsos positivos se monitorea mediante la regla del 80% (rango ético 0.80 a 1.25):",
        ],
      },
      {
        kind: "parity-meter",
        content: {
          intro: "Razón FPR Rural / Urbano = 1.04",
          value: 1.04,
          min: 0.5,
          max: 1.5,
          lower: 0.8,
          upper: 1.25,
          verdict: "Auditoría Aprobada",
          leftLabel: "0.50 (Discriminación Urbana)",
          rightLabel: "1.50 (Discriminación Rural)",
        },
      },
    ],
  },
  {
    id: "seccion-12",
    anchor: "articulo-conclusiones",
    dropdownLabel: "12. Conclusiones y Gobierno",
    sidebarLabel: "12. Conclusiones & Anexo D",
    page: "p. 12",
    title: "12. Conclusiones y Recomendaciones del Estudio",
    blocks: [
      {
        kind: "paragraph",
        segments: [
          "El presente estudio demuestra empíricamente que la inclusión de reglas ontológicas territoriales y modelado causal bayesiano salvaguarda al agricultor frente al sesgo derivado del dato contable incompleto. La combinación socio-técnica supera las limitaciones del machine learning no supervisado en contextos de alta informalidad agraria.",
        ],
      },
      {
        kind: "cards",
        variant: "conclusion",
        items: [
          {
            title: "1. Arquitectura Tripartita Validada",
            badge: { text: "Híbrida", tone: "brand" },
            body: "La integración ponderada de reglas ontológicas OWL (25%), redes bayesianas causales (35%) y gradiente XGBoost con isotonic regression (40%) proporciona un F1-Score equilibrado de 0.884, resolviendo el dilema entre precisión y explicabilidad exigido por el crédito solidario.",
          },
          {
            title: "2. Neutralización de Falsos Positivos",
            badge: { text: "Equidad", tone: "risk-low" },
            body: "El establecimiento de techos máximos a señales débiles (tope 0.10) y la activación de factores mitigadores contextuales (venta en plaza y ciclo de cosecha) comprimieron un 41.2% las falsas alarmas sin desmejorar el recall frente a fraudes deliberados.",
          },
          {
            title: "3. Paridad Algorítmica Demostrada",
            badge: { text: "FPR = 1.04", tone: "bias" },
            body: "La tasa de falsos positivos entre población rural y urbana se redujo de 2.14 a 1.04, cumpliendo de manera estricta la regla del 80% (rango ético 0.80 a 1.25) estipulada en los estándares internacionales de Fairness y la política CONPES 4144.",
          },
          {
            title: "4. Soberanía Decisional Humana",
            badge: { text: "100% Humano", tone: "trust" },
            body: "El artefacto funciona exclusivamente como sistema de recomendación analítica para el oficial y comité de crédito. Se erradican las decisiones o bloqueos automáticos, garantizando el derecho a la explicación consagrado en las Leyes 1266 y 2157.",
          },
        ],
      },
    ],
  },
];
