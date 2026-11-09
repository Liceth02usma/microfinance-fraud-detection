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
     * @description Evalúa una solicitud con el motor híbrido y devuelve puntaje de riesgo, semáforo, reglas activadas, probabilidades y factores explicativos. El sistema recomienda; la decisión final es del analista. NOTA (HU-17): en esta versión las probabilidades y reglas son EJEMPLOS deterministas de integración (engine_status reporta `missing`); los motores reales y la fusión híbrida se conectan en HU-18.
     */
    post: operations["evaluate_api_v1_evaluate_post"];
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
       * @description Versión del modelo
       * @default 0.1.0-baseline
       */
      modelo_version: string;
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
       * Model Version
       * @description Versión del modelo utilizado
       */
      model_version: string;
      /** @description Estado de motores: rules/bayesian/ml ok/missing */
      engine_status?: components["schemas"]["EngineStatus"] | null;
    };
    /**
     * FuenteDatos
     * @description Origen de los datos de la solicitud.
     * @enum {string}
     */
    FuenteDatos: "sintetico" | "real" | "test";
    /**
     * Genero
     * @description Género del solicitante.
     * @enum {string}
     */
    Genero: "femenino" | "masculino" | "otro";
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components["schemas"]["ValidationError"][];
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
     */
    RuleActivation: {
      /**
       * Id Regla
       * @description ID de la regla
       */
      id_regla: string;
      /**
       * Peso
       * @description Peso 0-1
       */
      peso: number;
      /**
       * Justificacion
       * @description Justificación en lenguaje claro
       */
      justificacion: string;
    };
    /**
     * Semaforo
     * @description Clasificación de riesgo (semáforo). La API recomienda; el humano decide (HU-09).
     * @enum {string}
     */
    Semaforo: "verde" | "amarillo" | "rojo";
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
