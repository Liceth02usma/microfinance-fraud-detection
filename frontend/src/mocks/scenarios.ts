/**
 * Escenarios de respuesta para el mocking del frontend (T23; HU-25, HU-26, HU-27).
 *
 * Cada escenario reproduce uno de los casos de referencia del backend
 * (`backend/tests/fixtures.py`), de modo que la interfaz se desarrolle contra
 * respuestas realistas sin levantar la API.
 *
 * Conmutación de escenarios:
 * - `setScenario(...)` fija un escenario concreto (demostraciones y pruebas).
 * - `"auto"` (por defecto) elige el escenario a partir de la solicitud entrante:
 *   1. Dos o más indicadores fuertes de fraude → `urbano-fraudulento` (rojo).
 *   2. Exactamente un indicador fuerte → `ambiguo` (amarillo), igual que el
 *      caso de referencia del backend: un solo fuerte no dispara el rojo.
 *   3. Solo señales débiles (5 o más) → `rural-legitimo` (verde).
 *   4. Cualquier otro caso → `ambiguo` (amarillo).
 *
 * Supuesto ético (HU-18): en modo auto una solicitud que solo tiene señales
 * débiles NUNCA resuelve en `urbano-fraudulento`, es decir, nunca llega a rojo.
 */

import type {
  EvaluationRequest,
  EvaluationResponse,
  components,
} from "../api/types/evaluation.types";

/** Escenarios que devuelven una `EvaluationResponse` válida del contrato HU-17. */
export type SuccessScenario = "rural-legitimo" | "urbano-fraudulento" | "ambiguo";

/** Escenarios de error HTTP que la UI debe manejar sin perder lo digitado. */
export type ErrorScenario = "503-servicio-cayido" | "422-validacion";

/** Todos los escenarios disponibles, más el modo automático. */
export type ScenarioName = "auto" | SuccessScenario | ErrorScenario;

/** Escenario ya resuelto (sin `"auto"`), listo para responder la petición. */
export type ResolvedScenario = Exclude<ScenarioName, "auto">;

/** Listado completo para conmutadores de UI o documentación. */
export const SCENARIO_NAMES: readonly ScenarioName[] = [
  "auto",
  "rural-legitimo",
  "urbano-fraudulento",
  "ambiguo",
  "503-servicio-cayido",
  "422-validacion",
];

/** Las 13 señales débiles de HU-02 (campos booleanos del contrato). */
const WEAK_SIGNAL_KEYS = [
  "sin_historial",
  "vive_lejos",
  "sin_local_fijo",
  "sin_fiador",
  "cedula_otra_region",
  "celular_prepago",
  "sin_cuenta_bancaria",
  "factura_manual",
  "fotos_poco_convincentes",
  "sin_referencias_comerciales",
  "nombre_distinto_recibo",
  "negocio_pequeno_monto",
  "direccion_sin_georreferenciar",
] as const;

/** Los 6 indicadores fuertes de HU-02 (campos booleanos del contrato). */
const STRONG_SIGNAL_KEYS = [
  "cedula_alterada",
  "ingresos_inconsistentes",
  "factura_falsa",
  "referencias_falsas",
  "historial_adverso",
  "negocio_inconsistente",
] as const;

/** Umbral de señales débiles para considerar el caso "rural legítimo". */
const WEAK_ONLY_THRESHOLD = 5;

/** Caso 1 (HU-27): rural legítimo con varias señales débiles → nunca rojo. */
const RURAL_LEGIT: EvaluationResponse = {
  risk_score: 12,
  semaforo: "verde",
  activated_rules: [],
  bayesian_probability: 0.08,
  ml_probability: 0.05,
  explanatory_factors: [
    "Caso rural con 8 señales débiles: frecuente en productores sin acceso al sistema financiero formal; no implica fraude (HU-18).",
    "Sin indicadores fuertes de fraude detectados.",
    "El sistema recomienda; la decisión final es del analista (HU-09).",
  ],
  model_version: "0.1.0-baseline",
  engine_status: { rules: "ok", bayesian: "ok", ml: "ok" },
};

/** Caso 2 (HU-27): urbano fraudulento con señales fuertes → rojo. */
const URBAN_FRAUD: EvaluationResponse = {
  risk_score: 95,
  semaforo: "rojo",
  activated_rules: [
    {
      id_regla: "R-STRONG-CEDULA",
      peso: 0.95,
      justificacion: "Cédula con alteraciones detectadas",
    },
    {
      id_regla: "R-STRONG-FACTURA",
      peso: 0.92,
      justificacion: "Factura presenta indicios de falsedad",
    },
  ],
  bayesian_probability: 0.92,
  ml_probability: 0.89,
  explanatory_factors: [
    "Se detectaron 6 indicador(es) fuerte(s) de fraude (HU-02).",
    "Cédula alterada y factura falsa son evidencia directa de fraude.",
    "El sistema recomienda rechazo; el comité humano confirma (HU-09).",
  ],
  model_version: "0.1.0-baseline",
  engine_status: { rules: "ok", bayesian: "ok", ml: "ok" },
};

/** Caso 3 (HU-27): mezcla sin indicios claros → amarillo (revisión manual). */
const AMBIGUOUS: EvaluationResponse = {
  risk_score: 45,
  semaforo: "amarillo",
  activated_rules: [
    {
      id_regla: "R-STRONG-INGRESOS",
      peso: 0.9,
      justificacion: "Ingresos declarados inconsistentes con el monto solicitado",
    },
  ],
  bayesian_probability: 0.45,
  ml_probability: 0.38,
  explanatory_factors: [
    "Un indicador fuerte presente: ingresos inconsistentes.",
    "Se recomienda revisión manual por analista.",
    "El sistema recomienda; la decisión final es del analista (HU-09).",
  ],
  model_version: "0.1.0-baseline",
  engine_status: { rules: "ok", bayesian: "ok", ml: "ok" },
};

/** Respuestas exitosas indexadas por nombre de escenario. */
export const SCENARIOS: Record<SuccessScenario, EvaluationResponse> = {
  "rural-legitimo": RURAL_LEGIT,
  "urbano-fraudulento": URBAN_FRAUD,
  ambiguo: AMBIGUOUS,
};

/** Detalle tipo FastAPI del escenario `503-servicio-cayido`. */
export const SERVICIO_CAYIDO_DETAIL =
  "Servicio de evaluación temporalmente no disponible (mock 503)";

/** Detalle tipo FastAPI (422) del escenario `422-validacion`. */
export const VALIDATION_DETAIL: components["schemas"]["HTTPValidationError"] = {
  detail: [
    {
      loc: ["body", "monto_solicitado"],
      msg: "Input should be greater than 1000000",
      type: "greater_than",
    },
    {
      loc: ["body", "plazo_meses"],
      msg: "Input should be less than or equal to 120",
      type: "less_than_equal",
    },
  ],
};

let activeScenario: ScenarioName = "auto";

/** Fija el escenario activo (pasa a `"auto"` para decidir por solicitud). */
export function setScenario(name: ScenarioName): void {
  activeScenario = name;
}

/** Devuelve el escenario activo actual. */
export function getScenario(): ScenarioName {
  return activeScenario;
}

/** Vuelve al modo automático. Se invoca en `afterEach` de las pruebas. */
export function resetScenario(): void {
  activeScenario = "auto";
}

/**
 * Resuelve qué escenario responde a una solicitud.
 *
 * En modo `"auto"` prioriza la ética HU-18: las señales débiles por sí solas
 * jamás llevan al escenario fraudulento (rojo); el rojo exige dos o más
 * indicadores fuertes.
 */
export function resolveScenario(request: EvaluationRequest): ResolvedScenario {
  if (activeScenario !== "auto") {
    return activeScenario;
  }

  const strongSignalCount = STRONG_SIGNAL_KEYS.filter((key) => request[key] === true).length;
  if (strongSignalCount >= 2) {
    return "urbano-fraudulento";
  }
  if (strongSignalCount === 1) {
    return "ambiguo";
  }

  const weakSignalCount = WEAK_SIGNAL_KEYS.filter((key) => request[key] === true).length;
  if (weakSignalCount >= WEAK_ONLY_THRESHOLD) {
    return "rural-legitimo";
  }

  return "ambiguo";
}
