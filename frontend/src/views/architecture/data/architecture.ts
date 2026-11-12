import type { ZoneKey } from "../zoneStyles";

/**
 * Datos estáticos del Mapa Interactivo de Arquitectura (contrato 01).
 *
 * Fuente: pantalla «CrediConfianza - Mapa Interactivo de Arquitectura
 * (Tema Claro)» de Stitch + `docs/contracts/frontend/01-mapa-interactivo.md`.
 * No consume la API: todo vive junto al código y se versiona con él.
 *
 * Los IDs de nodo (`nodo-*`) se conservan tal cual el contrato para trazabilidad.
 */

export interface ZoneDefinition {
  key: ZoneKey;
  /** Letra distintiva de la zona (badge y leyenda). */
  letter: string;
  /** Título completo de la zona (banner). */
  title: string;
  /** Metadato del banner derecho (p. ej. «2 Módulos Frontend»). */
  meta: string;
  /** Etiqueta corta de la leyenda del encabezado. */
  legendLabel: string;
  /** Nombre breve de la zona para el inspector (p. ej. «Núcleo Híbrido»). */
  shortName: string;
}

export interface ArchitectureNode {
  /** ID estable del nodo (contrato 01). */
  id: string;
  zone: ZoneKey;
  title: string;
  /** Descripción breve para la tarjeta del mapa. */
  cardDescription: string;
  /** Descripción detallada para el inspector (2–4 oraciones). */
  description: string;
  /** Características clave (3–5 items) del inspector. */
  features: string[];
  /** Rótulo del fragmento representativo. */
  fragmentLabel: string;
  /** Fragmento de código / fórmula representativo del nodo. */
  fragment: string;
  /** Ligadura del icono Material Symbols. */
  icon: string;
  /** Pastilla superior derecha de la tarjeta (HU, rol, etc.). */
  badge?: string;
  /** Etiqueta izquierda del pie de la tarjeta. */
  footerLeft: string;
  /** Etiqueta derecha del pie de la tarjeta (mono). */
  footerRight: string;
  /** Estado del motor cuando aplica (los motores muestran `ok`). */
  engineStatus?: "ok";
  /** Nodo destacado a ancho completo (Motor Híbrido). */
  featured?: boolean;
  /** Referencia mostrada en el pie del inspector. */
  reference: string;
}

export const zones: ZoneDefinition[] = [
  {
    key: "A",
    letter: "A",
    title: "Zona A · Entorno de Usuario (Canal Operativo & Explicabilidad)",
    meta: "2 Módulos Frontend",
    legendLabel: "Zona A: Entorno Usuario",
    shortName: "Entorno de Usuario",
  },
  {
    key: "B",
    letter: "B",
    title: "Zona B · Núcleo Híbrido (Razonamiento Tripartito & Fusión)",
    meta: "Motor Central",
    legendLabel: "Zona B: Núcleo Híbrido",
    shortName: "Núcleo Híbrido",
  },
  {
    key: "C",
    letter: "C",
    title: "Zona C · Conocimiento y Ética (Gobernanza, Reglas & Equidad)",
    meta: "3 Módulos Base",
    legendLabel: "Zona C: Conocimiento y Ética",
    shortName: "Conocimiento y Ética",
  },
];

/** Conectores visuales entre zonas (etiqueta obligatoria, contrato 01 §3.1). */
export interface ZoneConnector {
  from: ZoneKey;
  to: ZoneKey;
  /** Etiqueta izquierda de la pastilla. */
  startLabel: string;
  /** Texto central de la pastilla. */
  middleLabel: string;
  /** Etiqueta derecha de la pastilla. */
  endLabel: string;
}

export const connectors: ZoneConnector[] = [
  {
    from: "A",
    to: "B",
    startLabel: "Solicitud",
    middleLabel: "Evaluación / Score + Factores",
    endLabel: "",
  },
  {
    from: "B",
    to: "C",
    startLabel: "Reglas",
    middleLabel: "Actualización / Auditoría",
    endLabel: "",
  },
];

export const architectureNodes: ArchitectureNode[] = [
  /* ------------------------------------------------------------------ */
  /* Zona A · Entorno de Usuario                                         */
  /* ------------------------------------------------------------------ */
  {
    id: "nodo-originacion",
    zone: "A",
    title: "Interfaz de Originación",
    cardDescription:
      "Formulario urbano/rural que captura los 19 campos del EvaluationRequest; lanza POST /api/v1/evaluate (< 3 s).",
    description:
      "Formulario web urbano y rural que captura de manera unificada los 19 campos estandarizados del EvaluationRequest. Lanza la solicitud POST /api/v1/evaluate y garantiza una latencia de respuesta inferior a 3 segundos (HU-17) con soporte para conectividad intermitente de campo.",
    features: [
      "Captura integral de los 19 campos del contrato API (documentales, territoriales y financieros).",
      "Soporte adaptativo para ingreso de formularios urbanos y en veredas sin georreferenciación formal.",
      "Garantía de tiempo de respuesta de servicio menor a 3.0 segundos (criterio de aceptación HU-17).",
      "Validación previa de consistencia sintáctica y formato de documento antes del envío al backend.",
    ],
    fragmentLabel: "Contrato API · EvaluationRequest (JSON Schema)",
    fragment: `{
  "id_solicitud": "REQ-2026-VALLE-0491",
  "tipo_zona": "rural",
  "monto_solicitado": 4500000.0,
  "plazo_meses": 12,
  "ingreso_declarado": 1650000.0,
  "ingreso_estimado_visita": 1600000.0,
  "es_estacional": true,
  "sin_historial": true,
  "sin_local_fijo": true,
  "telefono_prepago": true,
  "coincidencia_ani": true
}`,
    icon: "request_quote",
    badge: "HU-17",
    footerLeft: "Inspeccionar",
    footerRight: "REST API",
    reference: "Contrato 01",
  },
  {
    id: "nodo-explicabilidad",
    zone: "A",
    title: "Subsistema de Explicabilidad",
    cardDescription:
      "Muestra explanatory_factors (≥ 3), desglose de atribución SHAP, pesos bayesianos y reglas activadas.",
    description:
      "Módulo de interpretabilidad y transparencia centrado en el ser humano. Expone un mínimo de tres factores explicativos (HU-20) por cada solicitud evaluada, desglosando los valores SHAP del modelo ML, las razones de verosimilitud de la red bayesiana y la lista trazable de reglas activadas.",
    features: [
      "Exposición obligatoria de al menos 3 factores explicativos comprensibles (criterio HU-20).",
      "Visualización divergente de valores SHAP (factores mitigantes vs. factores de alerta).",
      "Trazabilidad explícita de reglas disparadas con referencia a su justificación y código fuente.",
      "Generación de la ficha de explicabilidad para entrega formal al asociado bajo la Ley de Hábeas Data.",
    ],
    fragmentLabel: "Respuesta XAI · explanatory_factors (JSON)",
    fragment: `{
  "explanatory_factors": [
    {
      "factor": "Coherencia estacional de cosecha verificada",
      "impacto": -0.18,
      "motor": "reglas_mitigadoras",
      "descripcion": "Ingreso coherente con ciclo caficultor de la vereda."
    },
    {
      "factor": "Baja verificabilidad territorial amortiguada",
      "impacto": 0.05,
      "motor": "red_bayesiana",
      "descripcion": "LR neutralizado por condición de ruralidad dispersa."
    },
    {
      "factor": "Estabilidad productiva del asociado",
      "impacto": -0.12,
      "motor": "xgboost_shap",
      "descripcion": "Antigüedad en la parcela supera 36 meses."
    }
  ]
}`,
    icon: "search_insights",
    badge: "HU-20",
    footerLeft: "Inspeccionar",
    footerRight: "XAI Visual",
    reference: "Contrato 01",
  },

  /* ------------------------------------------------------------------ */
  /* Zona B · Núcleo Híbrido                                             */
  /* ------------------------------------------------------------------ */
  {
    id: "nodo-hibrido",
    zone: "B",
    title: "Motor Híbrido (Fusión)",
    cardDescription:
      "Combina sub-puntajes de los tres motores en un puntaje unificado y clasificación de riesgo mediante ponderación calibrada (w_reglas = 0.35, w_bayes = 0.30, w_ml = 0.35).",
    description:
      "Núcleo central de decisión que combina los sub-puntajes de los tres motores de razonamiento en un puntaje unificado en escala 0–100 y asigna la clasificación por bandas de riesgo (verde, amarillo y rojo). Los coeficientes de ponderación son totalmente configurables y auditables.",
    features: [
      "Ponderación lineal normalizada: w_reglas (0.35) + w_bayes (0.30) + w_ml (0.35) = 1.0.",
      "Clasificación por umbrales regulados: verde (<30), amarillo (30–60) y rojo (≥60).",
      "Soporte para recalibración dinámica de pesos sin reinicio de contenedores.",
      "Consolidación de la bitácora criptográfica inmutable para auditoría de la Supersolidaria.",
    ],
    fragmentLabel: "Fórmula de Fusión Ponderada & Clasificación",
    fragment: `score_final = w_reglas · score_reglas
            + w_bayes  · P(Fraude|evidencia) · 100
            + w_ml     · P_ml · 100

Pesos por defecto (configurables):
  w_reglas = 0.35 · w_bayes = 0.30 · w_ml = 0.35

Clasificación:
  score < 30      → verde     (aprobar)
  30 ≤ score < 60 → amarillo  (revisión manual)
  score ≥ 60      → rojo      (rechazar / alerta)`,
    icon: "merge_type",
    badge: "ORQUESTADOR",
    footerLeft: "Ver fórmula de fusión y pesos",
    footerRight: "Modelo v1.2",
    engineStatus: "ok",
    featured: true,
    reference: "Contrato 01",
  },
  {
    id: "nodo-reglas",
    zone: "B",
    title: "Motor de Reglas",
    cardDescription:
      "20–30 reglas YAML con categoría fuerte/débil. Señales débiles tienen condición de contexto rural (HU-11).",
    description:
      "Motor determinista que ejecuta entre 20 y 30 reglas formalizadas en YAML/JSON con identificador, condición lógica, peso, justificación y categorización estricta (fuerte o débil). Incorpora salvaguardas explícitas para neutralizar el sesgo rural en señales débiles (HU-11) y admite recarga en caliente.",
    features: [
      "Clasificación binaria de reglas: señales fuertes de fraude vs. señales débiles de informalidad.",
      "Condición estricta de contexto rural en señales débiles para evitar penalizar la exclusión bancaria (HU-11).",
      "Mecanismo de Hot-Reload para actualizar reglas en /knowledge sin detener la API.",
      "Techo acumulativo de 0.10 para la suma combinada de todas las señales débiles.",
    ],
    fragmentLabel: "Ejemplo de Regla YAML con Salvaguarda Rural",
    fragment: `- id: "R-WEAK-SIN-HISTORIAL"
  condicion: "sin_historial == true AND tipo_zona != 'rural'"
  peso: 0.15
  justificacion: "Sin historial crediticio fuera de zona rural; en zona rural es frecuente por exclusión histórica del sistema financiero formal."
  categoria: "debil"
  fuente: "analistas_crediconfianza_2024"`,
    icon: "checklist",
    footerLeft: "HU-10 / HU-11",
    footerRight: "YAML / Hot-reload",
    engineStatus: "ok",
    reference: "HU-11",
  },
  {
    id: "nodo-bayesiano",
    zone: "B",
    title: "Red Bayesiana (pgmpy)",
    cardDescription:
      "Modela P(Fraude | evidencia) con inferencia < 1 s. Nodos: zona, historial, negocio, señales débiles agregadas.",
    description:
      "Modelo probabilístico fundamentado en un Grafo Acíclico Dirigido (DAG) implementado con la biblioteca pgmpy. Estima la probabilidad condicional P(Fraude | evidencia) en un tiempo menor a 1 segundo, conectando nodos de zona, historial, tipo de negocio, señales agregadas y fraude latente (HU-20).",
    features: [
      "Inferencia exacta rápida con VariableElimination (< 1.0 s de latencia).",
      "Propagación formal de incertidumbre en presencia de datos incompletos o ruidosos.",
      "Modulación de razones de verosimilitud (LR) en función del contexto de verificabilidad.",
      "Parámetros e hiperparámetros documentados exhaustivamente en el código fuente (HU-20).",
    ],
    fragmentLabel: "Ecuación de Inferencia Bayesiana Causal",
    fragment: `P(Fraude | sin_cuenta, vive_lejos, plaza) =
  P(Fraude) · P(sin_cuenta|Fraude) · P(vive_lejos|Fraude) · P(plaza|Fraude)
  ──────────────────────────────────────────────────────────────────────────
                           P(evidencia)

Implementación: pgmpy · VariableElimination
Prior de Fraude: 0.08 (calibrado con expertos de CrediConfianza)`,
    icon: "share",
    footerLeft: "HU-20 Probabilístico",
    footerRight: "pgmpy",
    engineStatus: "ok",
    reference: "HU-20",
  },
  {
    id: "nodo-ml",
    zone: "B",
    title: "Modelo ML (XGBoost + SHAP)",
    cardDescription:
      "Clasificador supervisado estratificado (2–5% fraude). SHAP TreeExplainer para explicabilidad por instancia.",
    description:
      "Clasificador supervisado basado en Gradient Boosted Decision Trees (XGBoost) entrenado con un dataset sintético estratificado (2–5% prevalencia de fraude). Excluye variables protegidas directas y utiliza SHAP TreeExplainer para calcular la contribución marginal de cada variable por instancia.",
    features: [
      "Ensamble de árboles con calibración isotónica de probabilidades predictivas.",
      "Exclusión estricta de zona, género y pertenencia étnica como variables predictoras.",
      "Interpretabilidad aditiva local mediante SHAP (Shapley Additive Explanations).",
      "Monitoreo continuo contra deriva de datos (Data Drift) en épocas de cosecha cafetera.",
    ],
    fragmentLabel: "Pipeline de Entrenamiento & Inferencia SHAP",
    fragment: `import xgboost as xgb
import shap

# Clasificador con compensación por desbalance (scale_pos_weight)
model = xgb.XGBClassifier(
    n_estimators=150,
    max_depth=4,
    learning_rate=0.05,
    scale_pos_weight=12.5,
    random_state=42
)

# Explicabilidad local por instancia
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_eval)`,
    icon: "psychology",
    footerLeft: "SHAP Values",
    footerRight: "v1.2.4",
    engineStatus: "ok",
    reference: "Contrato 01",
  },

  /* ------------------------------------------------------------------ */
  /* Zona C · Conocimiento y Ética                                       */
  /* ------------------------------------------------------------------ */
  {
    id: "nodo-base-conocimiento",
    zone: "C",
    title: "Base de Conocimientos",
    cardDescription:
      "Reglas YAML validadas por esquema en /knowledge. 13 señales débiles + 6 indicadores fuertes de microcrédito.",
    description:
      "Repositorio declarativo centralizado que almacena todas las reglas de negocio en formato YAML estructurado, validadas contra esquema JSON en /knowledge. Contiene un catálogo formal de 13 señales débiles de informalidad y 6 indicadores fuertes de alteración documental (HU-02).",
    features: [
      "Validación sintáctica y semántica estricta contra JSON Schema previo a la carga.",
      "Estructura taxonómica: SeñalFuerte (R01–R07), SeñalDebil (R08–R16) y Mitigadores (M01–M04).",
      "Independencia total del motor de inferencia (separación conocimiento-lógica de ejecución).",
      "Historial de auditoría y versionado semántico en Git de cada modificación de umbrales.",
    ],
    fragmentLabel: "Taxonomía Ontológica OWL (Fragmento Turtle)",
    fragment: `@prefix ex: <http://crediconfianza.coop/sarc#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

ex:SenalDeFraude a owl:Class .
ex:SenalFuerte   rdfs:subClassOf ex:SenalDeFraude .
ex:SenalDebil    rdfs:subClassOf ex:SenalDeFraude .
ex:Mitigador     rdfs:subClassOf ex:SenalDeFraude .

ex:R08_SinHistorial a ex:SenalDebil ;
    ex:pesoMaximo 0.03 ;
    ex:contextualizadoPor ex:ZonaRural .`,
    icon: "menu_book",
    badge: "HU-02",
    footerLeft: "Inspeccionar",
    footerRight: "YAML Schema",
    reference: "Contrato 01",
  },
  {
    id: "nodo-etica",
    zone: "C",
    title: "Módulo de Ética y Equidad",
    cardDescription:
      "Calcula FPR por grupo (zona, género, etnia). Reporte de paridad demográfica y Equalized Odds con Fairlearn.",
    description:
      "Módulo guardián de gobernanza algorítmica que calcula la tasa de falsos positivos (FPR) por grupo sociodemográfico (zona urbana vs. rural, género y pertenencia étnica). Genera reportes de paridad demográfica y Equalized Odds mediante la biblioteca Fairlearn, sugiriendo umbrales equitativos (HU-04).",
    features: [
      "Cálculo y auditoría del ratio de paridad: FPR_rural / FPR_urbano dentro del rango [0.80, 1.25].",
      "Monitoreo continuo de Disparate Impact Ratio (DIR) y Equalized Odds con Fairlearn.",
      "Detección automática de variables correlacionadas que actúen como proxies encubiertos.",
      "Generación de alertas éticas obligatorias para revisión en el Comité de Riesgo SARC.",
    ],
    fragmentLabel: "Clasificación de Variables Protegidas (HU-04 / HU-18)",
    fragment: `Variable            | Clasificación      | Uso modelo | Uso auditoría
────────────────────|────────────────────|────────────|──────────────
tipo_zona           | proxy potencial    | No         | Sí (FPR rural vs urbana)
genero              | sensible           | No         | Sí (FPR por género)
pertenencia_etnica  | sensible           | No         | Sí (FPR campesino/indígena)
es_estacional       | proxy potencial    | Sí (neutro)| Sí (auditoría estacional)`,
    icon: "balance",
    badge: "HU-04",
    footerLeft: "Inspeccionar",
    footerRight: "fairlearn",
    reference: "HU-04",
  },
  {
    id: "nodo-dataset",
    zone: "C",
    title: "Dataset Sintético",
    cardDescription:
      "Registros anonimizados con semilla fija (2–5% fraude). Split estratificado por fraude × zona (urbana/rural).",
    description:
      "Conjunto de datos estructurado generado computacionalmente a partir de la parametrización de expertos, garantizando confidencialidad total bajo la Ley 1581 de 2012. Posee una semilla estocástica fija (seed=42), prevalencia controlada de fraude del 2 al 5% y split estratificado obligatorio por fraude × zona.",
    features: [
      "Generación sintética con distribución bimodal que refleja el ciclo de cosecha cafetera.",
      "Inclusión del campo obligatorio tipo_zona (urbana / rural) para validación de equidad.",
      "Garantía matemática de privacidad diferencial sin exposición de datos de asociados reales.",
      "Reproducibilidad experimental estricta mediante semilla pseudoaleatoria fijada.",
    ],
    fragmentLabel: "Esquema de Generación Sintética (Python Dataclass)",
    fragment: `@dataclass(frozen=True)
class SolicitudSintetica:
    id_solicitud: str
    tipo_zona: Literal["urbana", "rural"]     # Variable sensible protegida
    ingreso_mensual: float                    # Modulado por estacionalidad
    tiene_local_fijo: bool                    # Señal débil de baja verif.
    es_estacional: bool                       # Ciclo cafetero veredal
    fraude: int                               # Target binario (2-5% prevalencia)
    seed: int = 42`,
    icon: "database",
    badge: "Sintético",
    footerLeft: "Inspeccionar",
    footerRight: "Seed 42",
    reference: "Contrato 01",
  },
];
