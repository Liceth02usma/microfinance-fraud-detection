/**
 * Genera `src/api/types/evaluation.types.ts` desde el OpenAPI REAL del backend (HU-17).
 *
 * Uso:
 *   npm run generate:types                          # descarga de ${OPENAPI_URL}
 *   OPENAPI_PATH=../backend/openapi.json npm run generate:types   # esquema local (CI)
 *
 * Reglas del plan (T008 / criterio de diseño 3):
 *   - Usa `openapi-typescript` sobre el esquema publicado por FastAPI; no parsers manuales.
 *   - Si no puede obtener el esquema, o el esquema viene vacío/incompleto, termina con
 *     código de salida != 0. NUNCA escribe interfaces vacías ni de respaldo como éxito.
 *
 * Los tipos generados son un artefacto derivado: editar a mano tiene efecto local
 * hasta la siguiente regeneración, y CI detecta la deriva con `git diff --exit-code`.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import openapiTS, { astToString, type OpenAPI3 } from "openapi-typescript";
import prettier from "prettier";

/** Schemas Pydantic del contrato que deben existir y no pueden estar vacíos. */
const REQUIRED_SCHEMAS = [
  "EvaluationRequest",
  "EvaluationResponse",
  "RuleActivation",
  "EngineStatus",
] as const;

/**
 * Alias de conveniencia exportados al final del archivo, para que la UI importe
 * `EvaluationRequest` directamente en lugar de `components["schemas"]["..."]`.
 */
const EXPORTED_ALIASES = [
  "EvaluationRequest",
  "EvaluationResponse",
  "RuleActivation",
  "EngineStatus",
  "Semaforo",
  "TipoZona",
  "Genero",
  "PertenenciaEtnica",
  "ProductoCredito",
  "TipoNegocio",
  "FuenteDatos",
] as const;

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(SCRIPT_DIR, "..");
const OUTPUT_FILE = path.join(FRONTEND_DIR, "src", "api", "types", "evaluation.types.ts");
const DEFAULT_URL = "http://localhost:8000/openapi.json";

/** Error controlado: siempre termina el proceso con código 1 y un mensaje claro. */
class GenerationError extends Error {}

/** Devuelve el documento OpenAPI desde un archivo local o desde el backend en ejecución. */
async function loadOpenApiDocument(): Promise<OpenAPI3> {
  const localPath = process.env.OPENAPI_PATH;

  if (localPath && localPath.trim() !== "") {
    const absolute = path.resolve(FRONTEND_DIR, localPath);
    let raw: string;
    try {
      raw = await fs.readFile(absolute, "utf8");
    } catch {
      throw new GenerationError(
        `No se pudo leer el esquema local indicado en OPENAPI_PATH: ${absolute}`,
      );
    }
    console.log(`📄 Esquema local: ${absolute}`);
    return parseDocument(raw);
  }

  const url = process.env.OPENAPI_URL || DEFAULT_URL;
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GenerationError(
      `No se pudo contactar al backend en ${url} (${message}). ` +
        "Arranca el backend o exporta OPENAPI_PATH hacia un openapi.json real. " +
        "No se genera ningún tipo de respaldo.",
    );
  }
  if (!response.ok) {
    throw new GenerationError(`${url} respondió HTTP ${response.status}; se esperaba 200.`);
  }
  console.log(`🌐 Esquema descargado: ${url}`);
  return parseDocument(await response.text());
}

/** Convierte el texto en objeto validando que sea un documento OpenAPI utilizable. */
function parseDocument(raw: string): OpenAPI3 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GenerationError("El documento OpenAPI no es JSON válido.");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new GenerationError("El documento OpenAPI no es un objeto JSON.");
  }
  const doc = parsed as Record<string, unknown>;
  if (typeof doc.openapi !== "string" || !doc.openapi.startsWith("3")) {
    throw new GenerationError("El documento no declara `openapi: 3.x`.");
  }
  return parsed as OpenAPI3;
}

/**
 * Verifica que los DTO del contrato existan y tengan campos.
 * Un OpenAPI vacío (paths/schemas en cero) es un fallo, no una salida exitosa.
 */
function assertContract(doc: OpenAPI3): void {
  const schemas = doc.components?.schemas as Record<string, unknown> | undefined;
  if (!schemas) {
    throw new GenerationError("El OpenAPI no declara components.schemas.");
  }

  const missing = REQUIRED_SCHEMAS.filter((name) => !(name in schemas));
  if (missing.length > 0) {
    throw new GenerationError(`Faltan schemas en el OpenAPI: ${missing.join(", ")}.`);
  }

  const empty = REQUIRED_SCHEMAS.filter((name) => {
    const schema = schemas[name] as { properties?: Record<string, unknown> } | undefined;
    return !schema?.properties || Object.keys(schema.properties).length === 0;
  });
  if (empty.length > 0) {
    throw new GenerationError(
      `Schemas vacíos en el OpenAPI (sin propiedades): ${empty.join(", ")}. ` +
        "Esto indica un contrato incompleto; no se escriben tipos de respaldo.",
    );
  }

  const paths = Object.keys(doc.paths ?? {});
  if (!paths.includes("/api/v1/evaluate")) {
    throw new GenerationError("El OpenAPI no expone POST /api/v1/evaluate.");
  }
}

/** Cabecera fija del archivo generado. Sin marcas de tiempo: la salida debe ser determinista. */
const FILE_HEADER = [
  "/**",
  " * Archivo GENERADO desde el OpenAPI real del backend — NO EDITAR A MANO.",
  " * Fuente de verdad: backend/app/schemas/evaluation.py (contrato HU-17).",
  " * Regenerar: npm run generate:types (CI falla si este archivo está desactualizado).",
  " */",
  "",
].join("\n");

/** Construye el contenido final: cabecera + salida de openapi-typescript + alias tipados. */
async function buildContent(doc: OpenAPI3): Promise<string> {
  const nodes = await openapiTS(doc);
  const generated = astToString(nodes).trimEnd();
  const aliases = EXPORTED_ALIASES.map(
    (name) => `export type ${name} = components["schemas"]["${name}"];`,
  ).join("\n");

  return [
    FILE_HEADER.trimEnd(),
    generated,
    "",
    "// Alias tipados hacia los esquemas Pydantic del backend, para que la UI importe",
    '// tipos con nombre en lugar de `components["schemas"][...]`.',
    aliases,
    "",
  ].join("\n");
}

/** Escribe el archivo formateado con la configuración de Prettier del proyecto. */
async function writeOutput(content: string): Promise<void> {
  const config = (await prettier.resolveConfig(OUTPUT_FILE)) ?? {};
  const formatted = await prettier.format(content, { ...config, parser: "typescript" });
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, formatted, "utf8");
}

async function main(): Promise<void> {
  console.log("🧩 Generando tipos TypeScript desde el OpenAPI real del backend...\n");
  const doc = await loadOpenApiDocument();
  assertContract(doc);
  const content = await buildContent(doc);
  await writeOutput(content);

  const schemaNames = REQUIRED_SCHEMAS.join(", ");
  console.log(`\n✅ Tipos generados: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`   Schemas verificados: ${schemaNames}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ Generación de tipos fallida: ${message}`);
  process.exit(1);
});
