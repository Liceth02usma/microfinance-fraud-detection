/**
 * Archivo GENERADO desde el OpenAPI real del backend — NO EDITAR A MANO.
 * Fuente de verdad: backend/app/schemas/evaluation.py (contrato HU-17).
 * Regenerar: npm run generate:types (CI falla si este archivo está desactualizado).
 */
export interface paths {
  "/api/v1/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Health
     * @description Indica que el servicio está activo y devuelve el entorno actual.
     */
    get: operations["health_api_v1_health_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/evaluate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Evaluar solicitud de crédito
     * @description Evalúa una solicitud con el motor híbrido (reglas + red bayesiana + XGBoost) y devuelve puntaje de riesgo, semáforo, reglas activadas, probabilidades y factores explicativos. Los pesos de fusión y umbrales viven en app/core/fusion.yaml (HU-18/HU-19). Si un motor falta, se renormalizan los pesos y se reporta en engine_status (HU-18). El sistema recomienda; la decisión final es del analista (HU-09).
     */
    post: operations["evaluate_api_v1_evaluate_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/ethics/audit": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Auditoría ética y métricas de equidad
     * @description Consolida FPR por grupo con intervalos de confianza de Wilson, paridad demográfica y Equalized Odds sobre el split de prueba, métricas globales del modelo (AUC, F1, Precisión, Recall) y una sugerencia de ajuste de umbral (solo sugerencia: aplicarla exige bitácora HU-19). Las variables protegidas se usan únicamente como corte de auditoría, nunca como predictores (HU-04).
     */
    get: operations["ethics_audit_api_v1_ethics_audit_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/data/generate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Regenerar dataset sintético
     * @description Genera el dataset sintético determinista (semilla fija), lo valida contra el esquema, crea los splits estratificados por fraude y zona y el dataset de control sin sesgo rural. Tras regenerar debe reentrenarse el modelo y recalcularse la auditoría ética.
     */
    post: operations["generate_dataset_api_v1_data_generate_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/knowledge": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Base de conocimiento y configuración vigente
     * @description Reglas expertas cargadas desde knowledge/reglas.yaml, pesos de fusión, umbrales del semáforo y versión del modelo ML activo.
     */
    get: operations["knowledge_api_v1_knowledge_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/valuations": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Historial de valoraciones
     * @description Historial más reciente primero.
     */
    get: operations["list_valuations_api_v1_valuations_get"];
    put?: never;
    /**
     * Guardar valoración de un cliente
     * @description Recalcula la recomendación del sistema sobre la solicitud y la guarda junto con la decisión humana del analista y su motivo (HU-26).
     */
    post: operations["create_valuation_api_v1_valuations_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/valuations/export/pdf": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Descargar historial en PDF
     * @description Historial consolidado (hasta 500 valoraciones) en un PDF.
     */
    get: operations["export_valuations_pdf_api_v1_valuations_export_pdf_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/valuations/{valuation_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Detalle de una valoración
     * @description Valoración completa o 404.
     */
    get: operations["get_valuation_api_v1_valuations__valuation_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/valuations/{valuation_id}/pdf": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Descargar valoración en PDF
     * @description Ficha PDF de una valoración.
     */
    get: operations["valuation_pdf_api_v1_valuations__valuation_id__pdf_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /**
     * AnalystDecision
     * @description Decisión final del analista (el sistema solo recomienda).
     * @enum {string}
     */
    AnalystDecision: "aprobar" | "revision_comite" | "rechazar";
    /**
     * BayesianEvidence
     * @description Aporte de un nodo observado a P(fraude | evidencia).
     *
     *     `likelihood_ratio` = P(e | fraude, padres) / P(e | no fraude, padres):
     *     > 1 sube la probabilidad, < 1 la baja, ≈ 1 no la mueve.
     */
    BayesianEvidence: {
      /**
       * Variable
       * @description Nodo de la red
       */
      variable: string;
      /**
       * Observed
       * @description Valor observado (sí/no)
       */
      observed: boolean;
      /**
       * Kind
       * @description debil | fuerte
       */
      kind: string;
      /**
       * Likelihood Ratio
       * @description Razón de verosimilitud
       */
      likelihood_ratio: number;
    };
    /**
     * BayesianReasoning
     * @description Cadena prior → evidencia → posterior de la red bayesiana (HU-13).
     */
    BayesianReasoning: {
      /**
       * Prior
       * @description P(fraude | zona) antes de la evidencia
       */
      prior: number;
      /**
       * Posterior
       * @description P(fraude | toda la evidencia)
       */
      posterior: number;
      /**
       * Evidence
       * @description Evidencia ordenada por impacto |log LR|
       */
      evidence?: components["schemas"]["BayesianEvidence"][];
    };
    /**
     * DatasetGenerateRequest
     * @description Parámetros de regeneración del dataset sintético.
     */
    DatasetGenerateRequest: {
      /**
       * N Records
       * @description Número de registros sintéticos a generar
       * @default 15000
       */
      n_records: number;
      /**
       * Fraud Rate
       * @description Tasa de fraude real (2–5% recomendado, AGENTS.md)
       * @default 0.035
       */
      fraud_rate: number;
      /**
       * Seed
       * @description Semilla determinista
       * @default 42
       */
      seed: number;
    };
    /**
     * DatasetGenerateResponse
     * @description Rutas y metadatos del dataset regenerado.
     */
    DatasetGenerateResponse: {
      /**
       * Main Path
       * @description Dataset principal sintético
       */
      main_path: string;
      /**
       * Train Path
       * @description Split de entrenamiento
       */
      train_path: string;
      /**
       * Val Path
       * @description Split de validación
       */
      val_path: string;
      /**
       * Test Path
       * @description Split de prueba
       */
      test_path: string;
      /**
       * Control Path
       * @description Dataset de control sin sesgo rural
       */
      control_path: string;
      /**
       * N Records
       * @description Registros generados
       */
      n_records: number;
      /**
       * Fraud Rate
       * @description Tasa de fraude usada
       */
      fraud_rate: number;
      /**
       * Seed
       * @description Semilla usada
       */
      seed: number;
      /**
       * Warning
       * @description Advertencia: tras regenerar hay que reentrenar los modelos y recomputar la auditoría ética
       */
      warning: string;
    };
    /**
     * EngineReasoning
     * @description Razonamiento de cada motor; `None` si el motor no estuvo disponible.
     */
    EngineReasoning: {
      rules?: components["schemas"]["RulesReasoning"] | null;
      bayesian?: components["schemas"]["BayesianReasoning"] | null;
      ml?: components["schemas"]["MlReasoning"] | null;
      fusion: components["schemas"]["FusionReasoning"];
    };
    /**
     * EngineState
     * @description Estado de cada motor de evaluación.
     * @enum {string}
     */
    EngineState: "ok" | "missing";
    /**
     * EngineStatus
     * @description Estado de disponibilidad de cada motor.
     */
    EngineStatus: {
      /** @description Estado del motor de reglas */
      rules: components["schemas"]["EngineState"];
      /** @description Estado del motor bayesiano */
      bayesian: components["schemas"]["EngineState"];
      /** @description Estado del motor ML */
      ml: components["schemas"]["EngineState"];
    };
    /**
     * EthicsAuditResponse
     * @description Reporte consolidado de auditoría ética (GET /api/v1/ethics/audit).
     */
    EthicsAuditResponse: {
      /**
       * Generated At
       * @description Marca de tiempo ISO-8601 (UTC)
       */
      generated_at: string;
      /**
       * Dataset Path
       * @description Split evaluado
       */
      dataset_path: string;
      /**
       * Model Version
       * @description Versión del modelo ML auditado
       */
      model_version: string;
      /**
       * Positive Class
       * @description Clase positiva para las métricas: alerta roja
       * @default rojo
       */
      positive_class: string;
      global_metrics: components["schemas"]["GlobalMetrics"];
      /**
       * Fpr By Group
       * @description FPR por grupo de cada variable protegida
       */
      fpr_by_group?: components["schemas"]["GroupFPR"][];
      /**
       * Parity
       * @description Paridad demográfica y Equalized Odds por variable
       */
      parity?: components["schemas"]["ParityMetrics"][];
      threshold_suggestion: components["schemas"]["ThresholdSuggestion"];
      /**
       * Notes
       * @description Advertencias (grupos pequeños, datos faltantes)
       */
      notes?: string[];
    };
    /**
     * EvaluationRequest
     * @description Datos de entrada para la evaluación de riesgo de fraude.
     */
    EvaluationRequest: {
      /**
       * Id Solicitud
       * @description Identificador único (SOL-####-######)
       */
      id_solicitud: string;
      /** @description Zona: urbana o rural */
      tipo_zona: components["schemas"]["TipoZona"];
      /**
       * Oficina
       * @description Oficina de CrediConfianza
       */
      oficina: string;
      /** @description Género del solicitante */
      genero: components["schemas"]["Genero"];
      /** @description Pertenencia étnica */
      pertenencia_etnica: components["schemas"]["PertenenciaEtnica"];
      /** @description Producto de crédito */
      producto_credito: components["schemas"]["ProductoCredito"];
      /** @description Tipo de negocio */
      tipo_negocio: components["schemas"]["TipoNegocio"];
      /**
       * Monto Solicitado
       * @description Monto en COP
       */
      monto_solicitado: number;
      /**
       * Plazo Meses
       * @description Plazo en meses
       */
      plazo_meses: number;
      /**
       * Ingresos Declarados
       * @description Ingresos declarados en COP
       */
      ingresos_declarados: number;
      /**
       * Edad Solicitante
       * @description Edad del titular
       */
      edad_solicitante: number;
      /**
       * Es Estacional
       * @description ¿Negocio estacional?
       */
      es_estacional: boolean;
      /**
       * Antiguedad Negocio Meses
       * @description Antigüedad del negocio en meses (feature del modelo ML)
       * @default 36
       */
      antiguedad_negocio_meses: number;
      /**
       * Sin Historial
       * @description Sin historial crediticio
       */
      sin_historial: boolean;
      /**
       * Vive Lejos
       * @description Vive lejos de la oficina
       */
      vive_lejos: boolean;
      /**
       * Sin Local Fijo
       * @description Sin local fijo
       */
      sin_local_fijo: boolean;
      /**
       * Sin Fiador
       * @description Sin fiador
       */
      sin_fiador: boolean;
      /**
       * Cedula Otra Region
       * @description Cédula de otra región
       */
      cedula_otra_region: boolean;
      /**
       * Celular Prepago
       * @description Celular prepago
       */
      celular_prepago: boolean;
      /**
       * Sin Cuenta Bancaria
       * @description Sin cuenta bancaria
       */
      sin_cuenta_bancaria: boolean;
      /**
       * Factura Manual
       * @description Factura manual
       */
      factura_manual: boolean;
      /**
       * Fotos Poco Convincentes
       * @description Fotos poco convincentes
       */
      fotos_poco_convincentes: boolean;
      /**
       * Sin Referencias Comerciales
       * @description Sin referencias comerciales
       */
      sin_referencias_comerciales: boolean;
      /**
       * Nombre Distinto Recibo
       * @description Nombre distinto al del recibo
       */
      nombre_distinto_recibo: boolean;
      /**
       * Negocio Pequeno Monto
       * @description Negocio pequeño para el monto
       */
      negocio_pequeno_monto: boolean;
      /**
       * Direccion Sin Georreferenciar
       * @description Dirección sin georreferenciar
       */
      direccion_sin_georreferenciar: boolean;
      /**
       * Cedula Alterada
       * @description Cédula alterada
       * @default false
       */
      cedula_alterada: boolean;
      /**
       * Ingresos Inconsistentes
       * @description Ingresos inconsistentes
       * @default false
       */
      ingresos_inconsistentes: boolean;
      /**
       * Factura Falsa
       * @description Factura falsa
       * @default false
       */
      factura_falsa: boolean;
      /**
       * Referencias Falsas
       * @description Referencias falsas
       * @default false
       */
      referencias_falsas: boolean;
      /**
       * Historial Adverso
       * @description Historial adverso
       * @default false
       */
      historial_adverso: boolean;
      /**
       * Negocio Inconsistente
       * @description Negocio inconsistente
       * @default false
       */
      negocio_inconsistente: boolean;
      /**
       * Modelo Version
       * @description Versión del modelo que el cliente espera (informativa). La respuesta siempre reporta la versión realmente ejecutada.
       */
      modelo_version?: string | null;
      /**
       * @description Origen de datos
       * @default test
       */
      fuente_datos: components["schemas"]["FuenteDatos"];
    };
    /**
     * EvaluationResponse
     * @description Respuesta unificada del servicio de evaluación.
     *
     *     El sistema recomienda; la decisión final es del analista humano (HU-09, HU-26).
     */
    EvaluationResponse: {
      /**
       * Risk Score
       * @description Puntaje de riesgo 0-100
       */
      risk_score: number;
      /** @description Clasificación: verde/amarillo/rojo */
      semaforo: components["schemas"]["Semaforo"];
      /**
       * Activated Rules
       * @description Reglas activadas por el motor de reglas
       */
      activated_rules?: components["schemas"]["RuleActivation"][];
      /**
       * Bayesian Probability
       * @description P(Fraude | evidencia) según red bayesiana
       */
      bayesian_probability: number;
      /**
       * Ml Probability
       * @description Probabilidad del modelo ML
       */
      ml_probability: number;
      /**
       * Explanatory Factors
       * @description Factores explicativos (mínimo 3, HU-20)
       */
      explanatory_factors: string[];
      /**
       * Rules Subscore
       * @description Subpuntaje 0–1 del motor de reglas (antes de la fusión ponderada)
       * @default 0
       */
      rules_subscore: number;
      /**
       * Model Version
       * @description Versión del modelo utilizado
       */
      model_version: string;
      /** @description Estado de motores: rules/bayesian/ml ok/missing */
      engine_status?: components["schemas"]["EngineStatus"] | null;
      /** @description Razonamiento detallado de cada motor y de la fusión (HU-20) */
      reasoning?: components["schemas"]["EngineReasoning"] | null;
    };
    /**
     * FuenteDatos
     * @description Origen de los datos de la solicitud.
     * @enum {string}
     */
    FuenteDatos: "sintetico" | "real" | "test";
    /**
     * FusionInfo
     * @description Configuración vigente de la fusión y del semáforo (HU-18, HU-19).
     */
    FusionInfo: {
      /** Version */
      version: string;
      weights: components["schemas"]["FusionWeights"];
      /**
       * Verde Max
       * @description Puntaje < verde_max → verde
       */
      verde_max: number;
      /**
       * Amarillo Max
       * @description Puntaje < amarillo_max → amarillo; si no, rojo
       */
      amarillo_max: number;
      /** Strong Signal Floors */
      strong_signal_floors: components["schemas"]["StrongFloor"][];
    };
    /**
     * FusionPart
     * @description Aporte de un motor al puntaje fusionado.
     */
    FusionPart: {
      /**
       * Engine
       * @description rules | bayesian | ml
       */
      engine: string;
      /**
       * Weight
       * @description Peso efectivo (renormalizado si falta un motor)
       */
      weight: number;
      /**
       * Value
       * @description Salida 0–1 del motor
       */
      value: number;
      /**
       * Points
       * @description Aporte en puntos sobre 100
       */
      points: number;
    };
    /**
     * FusionReasoning
     * @description Desglose de la fusión ponderada y del semáforo (HU-18, HU-19).
     */
    FusionReasoning: {
      /** Parts */
      parts: components["schemas"]["FusionPart"][];
      /** Verde Max */
      verde_max: number;
      /** Amarillo Max */
      amarillo_max: number;
      /** Strong Count */
      strong_count: number;
      /** @description Semáforo solo por umbrales */
      semaforo_by_score: components["schemas"]["Semaforo"];
      /**
       * Floor Applied
       * @description ¿Un piso por indicios fuertes elevó el semáforo?
       */
      floor_applied: boolean;
      /** Fusion Version */
      fusion_version: string;
    };
    /**
     * FusionWeights
     * @description Pesos de la fusión ponderada (fusion.yaml).
     */
    FusionWeights: {
      /** Rules */
      rules: number;
      /** Bayesian */
      bayesian: number;
      /** Ml */
      ml: number;
    };
    /**
     * Genero
     * @description Género del solicitante.
     * @enum {string}
     */
    Genero: "femenino" | "masculino" | "otro";
    /**
     * GlobalMetrics
     * @description Métricas globales de desempeño sobre el split de prueba.
     */
    GlobalMetrics: {
      /**
       * N Samples
       * @description Filas evaluadas
       */
      n_samples: number;
      /**
       * Fraud Rate
       * @description Tasa real de fraude
       */
      fraud_rate: number;
      /**
       * Auc
       * @description AUC-ROC (score continuo)
       */
      auc?: number | null;
      /**
       * F1
       * @description F1 con umbral del semáforo
       */
      f1?: number | null;
      /**
       * Precision
       * @description Precisión (positivo = alerta roja)
       */
      precision?: number | null;
      /**
       * Recall
       * @description Recall (positivo = rojo)
       */
      recall?: number | null;
      /**
       * Accuracy
       * @description Exactitud
       */
      accuracy?: number | null;
      /**
       * Alert Rate
       * @description Tasa de alertas rojas sobre el total
       */
      alert_rate: number;
    };
    /**
     * GroupFPR
     * @description FPR (y tasa de selección) de un grupo con intervalo de confianza.
     */
    GroupFPR: {
      /**
       * Attribute
       * @description Variable protegida auditada
       */
      attribute: string;
      /**
       * Group
       * @description Valor del grupo
       */
      group: string;
      /**
       * N Samples
       * @description Muestras del grupo
       */
      n_samples: number;
      /**
       * N Actual Negative
       * @description No-fraudes reales (denominador del FPR)
       */
      n_actual_negative: number;
      /**
       * N False Positives
       * @description Falsos positivos del grupo
       */
      n_false_positives: number;
      /**
       * Fpr
       * @description Tasa de falsos positivos; None si sin negativos
       */
      fpr?: number | null;
      /**
       * Fpr Ci Low
       * @description Límite inferior IC 95% (Wilson)
       */
      fpr_ci_low?: number | null;
      /**
       * Fpr Ci High
       * @description Límite superior IC 95% (Wilson)
       */
      fpr_ci_high?: number | null;
      /**
       * Selection Rate
       * @description Proporción del grupo en alerta roja
       */
      selection_rate: number;
      /**
       * Sample Size Warning
       * @description True si n < 30 (grupo pequeño: interpretar con IC)
       * @default false
       */
      sample_size_warning: boolean;
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components["schemas"]["ValidationError"][];
    };
    /**
     * KnowledgeResponse
     * @description Base de conocimiento y configuración vigente del sistema.
     */
    KnowledgeResponse: {
      /** Rules Version */
      rules_version: string;
      /** Rules */
      rules: components["schemas"]["KnowledgeRule"][];
      fusion: components["schemas"]["FusionInfo"];
      /**
       * Model Version
       * @description Versión del modelo ML activo
       */
      model_version: string;
    };
    /**
     * KnowledgeRule
     * @description Una regla de `knowledge/reglas.yaml`, tal como la carga el motor.
     */
    KnowledgeRule: {
      /**
       * Id
       * @description Identificador de la regla (R-WEAK-01…)
       */
      id: string;
      /**
       * Categoria
       * @description debil | fuerte | salvaguarda | bias
       */
      categoria: string;
      /**
       * Senal
       * @description Señal asociada, si aplica
       */
      senal?: string | null;
      /**
       * Condicion
       * @description Condición en lenguaje claro
       */
      condicion: string;
      /**
       * Accion
       * @description Acción del motor
       */
      accion: string;
      /**
       * Peso
       * @description Peso de la regla (negativo = descuento)
       */
      peso: number;
      /**
       * Tope Rural
       * @description Tope del aporte en zona rural
       */
      tope_rural?: number | null;
      /**
       * Justificacion
       * @description Justificación en lenguaje claro
       */
      justificacion: string;
      /**
       * Fuente
       * @description Fuente del conocimiento
       */
      fuente: string;
      /**
       * Contexto Rural
       * @description Explicación rural legítima
       */
      contexto_rural?: string | null;
    };
    /**
     * MlReasoning
     * @description Variables que más empujaron la probabilidad del XGBoost (SHAP).
     */
    MlReasoning: {
      /** Probability */
      probability: number;
      /** Contributions */
      contributions?: components["schemas"]["ShapContribution"][];
    };
    /**
     * ParityMetrics
     * @description Paridad demográfica y Equalized Odds para una variable protegida (HU-21).
     */
    ParityMetrics: {
      /**
       * Attribute
       * @description Variable protegida
       */
      attribute: string;
      /**
       * Demographic Parity Difference
       * @description max selección − min selección entre grupos (0 = paridad perfecta)
       */
      demographic_parity_difference?: number | null;
      /**
       * Equalized Odds Difference
       * @description Máx. diferencia de TPR/FPR entre grupos (0 = igualdad exacta)
       */
      equalized_odds_difference?: number | null;
      /**
       * Selection Rates
       * @description Tasa de alerta por grupo
       */
      selection_rates?: {
        [key: string]: number;
      };
      /**
       * Fpr Ratio Max Min
       * @description FPR_max/FPR_min entre grupos (meta cooperativa [0.80, 1.25] invertida)
       */
      fpr_ratio_max_min?: number | null;
      /**
       * Within Parity Band
       * @description True si todas las tasas caen en la banda [0.80, 1.25] relativa
       */
      within_parity_band?: boolean | null;
    };
    /**
     * PertenenciaEtnica
     * @description Pertenencia étnica o campesina (variable sensible, HU-04).
     * @enum {string}
     */
    PertenenciaEtnica: "campesino" | "afrodescendiente" | "indigena" | "ninguno";
    /**
     * ProductoCredito
     * @description Producto de crédito solicitado.
     * @enum {string}
     */
    ProductoCredito: "consumo" | "microempresa" | "vivienda" | "agropecuario";
    /**
     * RuleActivation
     * @description Una regla activada por el motor de reglas.
     *
     *     `peso` puede ser negativo: las salvaguardas de equidad (R-SAFE-*) descuentan
     *     del subpuntaje para no castigar la ruralidad (HU-18).
     */
    RuleActivation: {
      /**
       * Id Regla
       * @description ID de la regla
       */
      id_regla: string;
      /**
       * Peso
       * @description Peso en [-1,1]; negativo = descuento
       */
      peso: number;
      /**
       * Justificacion
       * @description Justificación en lenguaje claro
       */
      justificacion: string;
    };
    /**
     * RulesReasoning
     * @description Cómo llegó el motor de reglas a su subpuntaje (HU-11, HU-18).
     */
    RulesReasoning: {
      /**
       * Strong Score
       * @description Suma de pesos de reglas fuertes y salvaguardas
       */
      strong_score: number;
      /**
       * Weak Score Raw
       * @description Suma de pesos de señales débiles sin topar
       */
      weak_score_raw: number;
      /**
       * Weak Score Applied
       * @description Aporte débil tras la salvaguarda rural
       */
      weak_score_applied: number;
      /**
       * Rural Cap
       * @description Tope de la salvaguarda rural R-SAFE-01
       */
      rural_cap: number;
      /**
       * Rural Cap Applied
       * @description ¿Se aplicó el tope rural?
       */
      rural_cap_applied: boolean;
      /**
       * Subscore
       * @description Subpuntaje final 0–1
       */
      subscore: number;
    };
    /**
     * Semaforo
     * @description Clasificación de riesgo (semáforo). La API recomienda; el humano decide (HU-09).
     * @enum {string}
     */
    Semaforo: "verde" | "amarillo" | "rojo";
    /**
     * ShapContribution
     * @description Contribución SHAP de una variable a la predicción del modelo ML (HU-20).
     */
    ShapContribution: {
      /** Feature */
      feature: string;
      /** Title */
      title: string;
      /**
       * Shap Value
       * @description > 0 aumenta el riesgo; < 0 lo reduce
       */
      shap_value: number;
      /**
       * Is Rural Context
       * @default false
       */
      is_rural_context: boolean;
    };
    /**
     * StrongFloor
     * @description Piso del semáforo según número de indicios fuertes.
     */
    StrongFloor: {
      /** Min Strong */
      min_strong: number;
      /** Semaforo */
      semaforo: string;
    };
    /**
     * ThresholdSuggestion
     * @description Ajuste equitativo de umbral sugerido (HU-19/HU-21) — no aplica automáticamente.
     */
    ThresholdSuggestion: {
      /**
       * Current Threshold
       * @description Umbral rojo vigente (score 0-100)
       */
      current_threshold: number;
      /**
       * Suggested Threshold
       * @description Umbral que minimiza la brecha FPR rural-urbana
       */
      suggested_threshold: number;
      /**
       * Fpr Gap At Current
       * @description |FPR_rural − FPR_urbano| con el umbral actual
       */
      fpr_gap_at_current?: number | null;
      /**
       * Fpr Gap At Suggested
       * @description |FPR_rural − FPR_urbano| con el umbral sugerido
       */
      fpr_gap_at_suggested?: number | null;
      /**
       * Recall At Current
       * @description Recall con umbral actual
       */
      recall_at_current?: number | null;
      /**
       * Recall At Suggested
       * @description Recall con umbral sugerido
       */
      recall_at_suggested?: number | null;
      /**
       * Rationale
       * @description Justificación en lenguaje claro; todo cambio requiere bitácora HU-19
       */
      rationale: string;
    };
    /**
     * TipoNegocio
     * @description Tipo de negocio declarado.
     * @enum {string}
     */
    TipoNegocio: "local_fijo" | "plaza_mercado_feria" | "parcela_finca" | "servicios_domicilio";
    /**
     * TipoZona
     * @description Tipo de zona del solicitante.
     * @enum {string}
     */
    TipoZona: "urbana" | "rural";
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
      /** Input */
      input?: unknown;
      /** Context */
      ctx?: Record<string, never>;
    };
    /**
     * ValuationCreate
     * @description Datos que envía la interfaz para guardar una valoración.
     */
    ValuationCreate: {
      /**
       * Cliente Nombre
       * @description Nombre del cliente
       */
      cliente_nombre: string;
      /**
       * Cliente Documento
       * @description Documento o código del asociado
       */
      cliente_documento: string;
      /**
       * Analista
       * @description Analista responsable
       */
      analista: string;
      /** @description Decisión humana final */
      decision: components["schemas"]["AnalystDecision"];
      /**
       * Motivo
       * @description Motivo de la decisión (obligatorio)
       */
      motivo: string;
      /**
       * Observaciones
       * @description Notas adicionales
       */
      observaciones?: string | null;
      /** @description Solicitud evaluada */
      solicitud: components["schemas"]["EvaluationRequest"];
    };
    /**
     * ValuationList
     * @description Historial paginado de valoraciones.
     */
    ValuationList: {
      /** Total */
      total: number;
      /** Items */
      items: components["schemas"]["ValuationSummary"][];
    };
    /**
     * ValuationRecord
     * @description Valoración completa, con solicitud, resultado y trazabilidad.
     */
    ValuationRecord: {
      /** Id */
      id: number;
      /**
       * Created At
       * @description Fecha ISO 8601 (UTC)
       */
      created_at: string;
      /** Cliente Nombre */
      cliente_nombre: string;
      /** Cliente Documento */
      cliente_documento: string;
      /** Analista */
      analista: string;
      /** Tipo Zona */
      tipo_zona: string;
      /** Monto Solicitado */
      monto_solicitado: number;
      /** Risk Score */
      risk_score: number;
      semaforo: components["schemas"]["Semaforo"];
      decision: components["schemas"]["AnalystDecision"];
      /**
       * Sigue Recomendacion
       * @description True si la decisión coincide con la recomendación del semáforo
       */
      sigue_recomendacion: boolean;
      /** Motivo */
      motivo: string;
      /** Observaciones */
      observaciones?: string | null;
      solicitud: components["schemas"]["EvaluationRequest"];
      resultado: components["schemas"]["EvaluationResponse"];
      /**
       * Version Sistema
       * @description Versiones de modelo, fusión y reglas
       */
      version_sistema: string;
    };
    /**
     * ValuationSummary
     * @description Fila del historial de valoraciones.
     */
    ValuationSummary: {
      /** Id */
      id: number;
      /**
       * Created At
       * @description Fecha ISO 8601 (UTC)
       */
      created_at: string;
      /** Cliente Nombre */
      cliente_nombre: string;
      /** Cliente Documento */
      cliente_documento: string;
      /** Analista */
      analista: string;
      /** Tipo Zona */
      tipo_zona: string;
      /** Monto Solicitado */
      monto_solicitado: number;
      /** Risk Score */
      risk_score: number;
      semaforo: components["schemas"]["Semaforo"];
      decision: components["schemas"]["AnalystDecision"];
      /**
       * Sigue Recomendacion
       * @description True si la decisión coincide con la recomendación del semáforo
       */
      sigue_recomendacion: boolean;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  health_api_v1_health_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: string;
          };
        };
      };
    };
  };
  evaluate_api_v1_evaluate_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["EvaluationRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["EvaluationResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  ethics_audit_api_v1_ethics_audit_get: {
    parameters: {
      query?: {
        /** @description Tamaño opcional de muestra estratificada (para pruebas rápidas) */
        sample_size?: number | null;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["EthicsAuditResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  generate_dataset_api_v1_data_generate_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["DatasetGenerateRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DatasetGenerateResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  knowledge_api_v1_knowledge_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["KnowledgeResponse"];
        };
      };
    };
  };
  list_valuations_api_v1_valuations_get: {
    parameters: {
      query?: {
        limit?: number;
        offset?: number;
        /** @description Buscar por nombre/documento */
        q?: string | null;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ValuationList"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_valuation_api_v1_valuations_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ValuationCreate"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ValuationRecord"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  export_valuations_pdf_api_v1_valuations_export_pdf_get: {
    parameters: {
      query?: {
        q?: string | null;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_valuation_api_v1_valuations__valuation_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        valuation_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ValuationRecord"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  valuation_pdf_api_v1_valuations__valuation_id__pdf_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        valuation_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
}

// Alias tipados hacia los esquemas Pydantic del backend, para que la UI importe
// tipos con nombre en lugar de `components["schemas"][...]`.
export type EvaluationRequest = components["schemas"]["EvaluationRequest"];
export type EvaluationResponse = components["schemas"]["EvaluationResponse"];
export type RuleActivation = components["schemas"]["RuleActivation"];
export type EngineStatus = components["schemas"]["EngineStatus"];
export type Semaforo = components["schemas"]["Semaforo"];
export type TipoZona = components["schemas"]["TipoZona"];
export type Genero = components["schemas"]["Genero"];
export type PertenenciaEtnica = components["schemas"]["PertenenciaEtnica"];
export type ProductoCredito = components["schemas"]["ProductoCredito"];
export type TipoNegocio = components["schemas"]["TipoNegocio"];
export type FuenteDatos = components["schemas"]["FuenteDatos"];
export type KnowledgeResponse = components["schemas"]["KnowledgeResponse"];
export type KnowledgeRule = components["schemas"]["KnowledgeRule"];
export type ValuationCreate = components["schemas"]["ValuationCreate"];
export type ValuationSummary = components["schemas"]["ValuationSummary"];
export type ValuationRecord = components["schemas"]["ValuationRecord"];
export type ValuationList = components["schemas"]["ValuationList"];
export type AnalystDecision = components["schemas"]["AnalystDecision"];
export type EngineReasoning = components["schemas"]["EngineReasoning"];
export type RulesReasoning = components["schemas"]["RulesReasoning"];
export type BayesianReasoning = components["schemas"]["BayesianReasoning"];
export type BayesianEvidence = components["schemas"]["BayesianEvidence"];
export type MlReasoning = components["schemas"]["MlReasoning"];
export type ShapContribution = components["schemas"]["ShapContribution"];
export type FusionReasoning = components["schemas"]["FusionReasoning"];
export type FusionPart = components["schemas"]["FusionPart"];
