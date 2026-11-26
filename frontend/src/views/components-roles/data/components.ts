/**
 * Datos estáticos de la vista «Componentes & Roles» (contrato 03).
 *
 * Fuente: pantalla «CrediConfianza - Componentes & Roles (Diseño Refactorizado)»
 * de Stitch + `docs/contracts/frontend/03-componentes-roles.md`.
 * No consume la API: las constantes se versionan junto al código.
 *
 * Identificadores en inglés (convención del repositorio), copy en español.
 */

/** Capas arquitectónicas del sistema (pastillas de color de la Sección A). */
export type SystemLayer = "Usuario" | "Núcleo Híbrido" | "Conocimiento & Ética";

export interface SystemComponent {
  /** Nombre visible del componente. */
  name: string;
  /** Subtítulo técnico (p. ej. `frontend-app/v2.4`). */
  slug: string;
  layer: SystemLayer;
  technology: string;
  /** Una oración con la función principal. */
  function: string;
  /** Con qué otro componente se comunica principalmente. */
  interaction: string;
  /** Ligadura del icono Material Symbols. */
  icon: string;
}

export interface WeakSignal {
  number: number;
  /** Nombre corto en español. */
  name: string;
  /** Campo exacto del `EvaluationRequest`. */
  field: string;
  /** Por qué NO implica fraude en zona rural (HU-18). */
  ruralContext: string;
}

export interface StrongIndicator {
  number: number;
  name: string;
  field: string;
  /** Evidencia directa de fraude, independiente del contexto. */
  justification: string;
}

/** Clasificación ética de una variable (HU-04). */
export type Sensitivity = "Sensible" | "Proxy potencial" | "Neutral";

export interface ProtectedVariable {
  /** Nombre del campo. */
  variable: string;
  /** Dominio entre paréntesis (p. ej. `urbana/rural`). */
  hint?: string;
  /** `true` cuando la celda usa tipografía monoespaciada (nombre de campo). */
  monospace: boolean;
  dataType: string;
  classification: Sensitivity;
  /** Uso en el modelo predictivo (texto descriptivo del diseño). */
  modelUse: string;
  /** Uso en la auditoría ética. */
  auditUse: string;
}

export interface HumanRole {
  role: string;
  icon: string;
  responsibility: string;
  decisions: string;
}

export const SYSTEM_COMPONENTS: SystemComponent[] = [
  {
    name: "Interfaz de Originación",
    slug: "frontend-app/v2.4",
    layer: "Usuario",
    technology: "React + Vite + TypeScript",
    function: "Captura los 19 campos del EvaluationRequest y lanza la evaluación. Respuesta < 3 s.",
    interaction: "Llama a POST /api/v1/evaluate",
    icon: "desktop_windows",
  },
  {
    name: "Subsistema de Explicabilidad",
    slug: "xai-dashboard/layer",
    layer: "Usuario",
    technology: "React + SHAP values + reglas",
    function:
      "Muestra ≥ 3 factores explicativos en lenguaje natural, desglose de pesos y reglas activadas.",
    interaction: "Consume la EvaluationResponse",
    icon: "visibility",
  },
  {
    name: "Motor Híbrido (Fusión)",
    slug: "hybrid-engine/orchestrator",
    layer: "Núcleo Híbrido",
    technology: "Python + FastAPI + Pydantic",
    function:
      "Combina sub-puntajes de los tres motores en score 0–100 y semáforo verde/amarillo/rojo.",
    interaction: "Orquesta Reglas, Bayesiano y ML",
    icon: "hub",
  },
  {
    name: "Motor de Reglas",
    slug: "rule-engine/inference",
    layer: "Núcleo Híbrido",
    technology: "Python + YAML / JSON",
    function: "Evalúa 20–30 reglas con condición de contexto. Recarga sin reinicio.",
    interaction: "Lee Base de Conocimientos; devuelve reglas activadas",
    icon: "rule",
  },
  {
    name: "Red Bayesiana",
    slug: "bayes-net/pgmpy-core",
    layer: "Núcleo Híbrido",
    technology: "pgmpy · VariableElimination",
    function: "Modela P(Fraude | evidencia). Inferencia < 1 s.",
    interaction: "Recibe señales del formulario; actualiza probabilidades",
    icon: "analytics",
  },
  {
    name: "Modelo ML",
    slug: "ml-classifier/v1.12",
    layer: "Núcleo Híbrido",
    technology: "XGBoost / scikit-learn + SHAP",
    function: "Clasificador supervisado; SHAP por instancia para explicabilidad.",
    interaction: "Entrenado con Dataset Sintético; devuelve ml_probability",
    icon: "psychology",
  },
  {
    name: "Base de Conocimientos",
    slug: "knowledge-repo/rules-v3",
    layer: "Conocimiento & Ética",
    technology: "YAML + JSON schema",
    function:
      "Almacena 20–30 reglas validadas (ID, condición, peso, justificación, categoría fuerte/débil).",
    interaction: "Leída por Motor de Reglas; actualizable sin código",
    icon: "menu_book",
  },
  {
    name: "Módulo de Ética y Equidad",
    slug: "fairness-auditor/disparity",
    layer: "Conocimiento & Ética",
    technology: "fairlearn + pandas",
    function:
      "Calcula FPR por grupo, paridad demográfica y Equalized Odds. Sugiere umbrales equitativos.",
    interaction: "Consume Dataset Sintético + decisiones del analista",
    icon: "balance",
  },
  {
    name: "Dataset Sintético",
    slug: "synth-data/sarc-seeded",
    layer: "Conocimiento & Ética",
    technology: "pandas + numpy + Faker",
    function:
      "Registros anonimizados, semilla fija, 2–5 % fraude, split estratificado zona × fraude.",
    interaction: "Base de entrenamiento del Modelo ML y auditoría ética",
    icon: "database",
  },
];

export const WEAK_SIGNALS: WeakSignal[] = [
  {
    number: 1,
    name: "Sin historial crediticio",
    field: "sin_historial",
    ruralContext:
      "Muchos productores rurales nunca accedieron al sistema financiero formal; la ausencia de historial refleja exclusión histórica, no intención fraudulenta.",
  },
  {
    number: 2,
    name: "Vive lejos de la oficina",
    field: "vive_lejos",
    ruralContext:
      "Las parcelas y veredas están a 30–90 min de la cabecera; la distancia es una realidad geográfica, no una señal de evasión.",
  },
  {
    number: 3,
    name: "Sin local fijo",
    field: "sin_local_fijo",
    ruralContext:
      "El comercio en plaza o feria, el trabajo en parcela y los servicios a domicilio son formas legítimas de negocio en la ruralidad.",
  },
  {
    number: 4,
    name: "Sin fiador",
    field: "sin_fiador",
    ruralContext:
      "Las redes de garantía formal son escasas en comunidades rurales; la comunidad misma actúa como red de respaldo informal.",
  },
  {
    number: 5,
    name: "Cédula de otra región",
    field: "cedula_otra_region",
    ruralContext:
      "La movilidad migratoria de campesinos e indígenas es frecuente; la cédula puede reflejar la región de nacimiento, no la de residencia actual.",
  },
  {
    number: 6,
    name: "Celular prepago",
    field: "celular_prepago",
    ruralContext:
      "En zonas rurales la cobertura es limitada; el prepago es la modalidad predominante, no un indicador de anonimato.",
  },
  {
    number: 7,
    name: "Sin cuenta bancaria",
    field: "sin_cuenta_bancaria",
    ruralContext:
      "El efectivo sigue siendo el medio de intercambio dominante en mercados rurales y ferias agropecuarias.",
  },
  {
    number: 8,
    name: "Factura manual",
    field: "factura_manual",
    ruralContext:
      "Muchos negocios informales rurales emiten facturas manuscritas; la informalidad documental no equivale a falsificación.",
  },
  {
    number: 9,
    name: "Fotos poco convincentes",
    field: "fotos_poco_convincentes",
    ruralContext:
      "La conectividad intermitente en zonas rurales limita la calidad fotográfica; una foto borrosa no es evidencia de negocio inexistente.",
  },
  {
    number: 10,
    name: "Sin referencias comerciales",
    field: "sin_referencias_comerciales",
    ruralContext:
      "Las redes comerciales formales son escasas en economías de subsistencia y agricultura familiar.",
  },
  {
    number: 11,
    name: "Nombre distinto al del recibo",
    field: "nombre_distinto_recibo",
    ruralContext:
      "La titularidad de servicios suele recaer en un familiar mayor; el solicitante puede ser arrendatario o hijo del titular.",
  },
  {
    number: 12,
    name: "Negocio pequeño para el monto",
    field: "negocio_pequeno_monto",
    ruralContext:
      "El microcrédito agropecuario suele financiar ampliaciones; el tamaño actual del negocio no refleja su capacidad proyectada.",
  },
  {
    number: 13,
    name: "Dirección sin georreferenciar",
    field: "direccion_sin_georreferenciar",
    ruralContext:
      "Las veredas, caseríos y parcelas carecen de nomenclatura urbana; la ausencia de coordenadas refleja un déficit de infraestructura cartográfica.",
  },
];

export const STRONG_INDICATORS: StrongIndicator[] = [
  {
    number: 1,
    name: "Cédula alterada",
    field: "cedula_alterada",
    justification: "La manipulación documental es evidencia directa de identidad falsa.",
  },
  {
    number: 2,
    name: "Ingresos inconsistentes",
    field: "ingresos_inconsistentes",
    justification:
      "La inconsistencia verificable entre ingresos declarados y actividad real indica declaración fraudulenta.",
  },
  {
    number: 3,
    name: "Factura falsa",
    field: "factura_falsa",
    justification: "La falsificación de comprobantes es un indicador directo de fraude documental.",
  },
  {
    number: 4,
    name: "Referencias falsas",
    field: "referencias_falsas",
    justification:
      "Las referencias inventadas o no verificables apuntan a construcción deliberada de un perfil falso.",
  },
  {
    number: 5,
    name: "Historial adverso",
    field: "historial_adverso",
    justification:
      "Registros de impago o fraude previo en centrales de riesgo son evidencia objetiva de riesgo elevado.",
  },
  {
    number: 6,
    name: "Negocio inconsistente",
    field: "negocio_inconsistente",
    justification:
      "Cuando la descripción del negocio no corresponde a la actividad real verificada, indica fraude en la solicitud.",
  },
];

export const PROTECTED_VARIABLES: ProtectedVariable[] = [
  {
    variable: "tipo_zona",
    hint: "urbana/rural",
    monospace: true,
    dataType: "Categórica",
    classification: "Proxy potencial",
    modelUse: "No",
    auditUse: "Sí — FPR rural vs. urbana",
  },
  {
    variable: "genero",
    hint: "femenino/masculino/otro",
    monospace: true,
    dataType: "Categórica",
    classification: "Sensible",
    modelUse: "No",
    auditUse: "Sí — FPR por género",
  },
  {
    variable: "pertenencia_etnica",
    hint: "campesino/afrodescendiente/indígena/ninguno",
    monospace: true,
    dataType: "Categórica",
    classification: "Sensible",
    modelUse: "No",
    auditUse: "Sí — FPR por grupo étnico",
  },
  {
    variable: "es_estacional",
    monospace: true,
    dataType: "Booleana",
    classification: "Proxy potencial",
    modelUse: "Sí (solo como contexto)",
    auditUse: "Sí",
  },
  {
    variable: "monto_solicitado",
    monospace: true,
    dataType: "Numérica",
    classification: "Neutral",
    modelUse: "Sí",
    auditUse: "No",
  },
  {
    variable: "ingresos_declarados",
    monospace: true,
    dataType: "Numérica",
    classification: "Neutral",
    modelUse: "Sí",
    auditUse: "No",
  },
  {
    variable: "edad_solicitante",
    monospace: true,
    dataType: "Numérica",
    classification: "Proxy potencial",
    modelUse: "Sí (con monitoreo)",
    auditUse: "Sí",
  },
  {
    variable: "tipo_negocio",
    monospace: true,
    dataType: "Categórica",
    classification: "Proxy potencial",
    modelUse: "Sí",
    auditUse: "Sí — distribución por tipo",
  },
  {
    variable: "Señales débiles (13)",
    monospace: false,
    dataType: "Booleanas",
    classification: "Proxy potencial",
    modelUse: "Sí (con condición de contexto)",
    auditUse: "Sí — FPR por señal",
  },
  {
    variable: "Indicadores fuertes (6)",
    monospace: false,
    dataType: "Booleanas",
    classification: "Neutral",
    modelUse: "Sí",
    auditUse: "Sí",
  },
];

export const HUMAN_ROLES: HumanRole[] = [
  {
    role: "Analista de Crédito",
    icon: "person_check",
    responsibility:
      "Revisa la recomendación del sistema y toma la decisión final sobre la solicitud.",
    decisions:
      "Aprobar, rechazar o solicitar más información. Debe registrar la razón de su decisión.",
  },
  {
    role: "Comité de Riesgo",
    icon: "groups",
    responsibility:
      "Revisa casos amarillo escalados y casos rojo con solicitud de reconsideración.",
    decisions:
      "Decisión final en casos complejos. Puede ajustar el umbral de semáforo temporalmente.",
  },
  {
    role: "Ingeniero del Conocimiento",
    icon: "build",
    responsibility:
      "Mantiene y actualiza las reglas YAML en /knowledge. Valida cambios contra el esquema.",
    decisions: "Agregar, modificar o desactivar reglas sin tocar el motor.",
  },
  {
    role: "Experto en Dominio",
    icon: "psychology_alt",
    responsibility:
      "Provee el conocimiento sobre fraude y contexto rural. Revisa los factores explicativos.",
    decisions:
      "Validar que las justificaciones de las reglas reflejen la realidad del microcrédito.",
  },
  {
    role: "Auditor Ético",
    icon: "gavel",
    responsibility: "Revisa periódicamente los reportes de paridad (FPR por grupo).",
    decisions: "Proponer ajustes de umbral para garantizar equidad. Firma el reporte ético.",
  },
  {
    role: "Ingeniero de ML",
    icon: "precision_manufacturing",
    responsibility: "Entrena, evalúa y versiona el modelo. Monitorea AUC, F1, deriva del modelo.",
    decisions: "Decidir cuándo re-entrenar. Aprobar el paso a producción de una nueva versión.",
  },
];

/** Checklist que muestra el botón «Verificar Conformidad HU-26» (diseño). */
export const CONFORMITY_CHECKLIST: string[] = [
  "9/9 Componentes del sistema auditados",
  "13 Señales débiles contextualizadas y 6 indicadores críticos validados",
  "Salvaguarda ética: Activa",
  "Protocolo HITL y W3C PROV-O: Conforme",
  "Aislamiento de variables sensibles (Género / Etnia): Verificado",
];
