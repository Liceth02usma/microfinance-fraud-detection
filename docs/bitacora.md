# Bitácora de decisiones

Registro cronológico de las decisiones técnicas del proyecto, con su motivación y
evidencia. Cada entrada corresponde a una historia de usuario o a un hallazgo que
altera el alcance acordado.

**Formato de entrada:** fecha · historia/tema · decisión · motivación · evidencia · estado.

---

## 2026-11-08 · HU-17 — Servicio FastAPI y contrato de la API

**Fuente de requisitos:** `docs/backlog.md` (HU-17), `AGENTS.md`, `plan.md` (plan de cierre HU-17).

### Decisiones de contrato

| # | Decisión | Motivación |
| --- | --- | --- |
| D1 | El identificador de campo en JSON es `semaforo` **sin tilde**; `semáforo` solo aparece en textos humanos. | Un mismo concepto con dos grafías rompe la integración backend-frontend. Se verificó con prueba explícita en `backend/tests/test_evaluate_contract.py`. |
| D2 | El contrato vive en `backend/app/schemas/evaluation.py` (DTO Pydantic) y la ruta `POST /api/v1/evaluate` usa `response_model`. | HU-01/AGENTS: Pydantic define el contrato desde el primer día y la OpenAPI se deriva de él, no se escribe a mano. |
| D3 | La ruta delega en `backend/app/services/evaluation_service.py`; el controlador no contiene lógica de negocio. | AGENTS: mantener la lógica de negocio desacoplada de controladores y de la UI. |
| D4 | El servicio devuelve **ejemplos deterministas** de integración (los motores reales llegan con HU-18) y la documentación lo dice explícitamente. | HU-17: los datos de ejemplo cumplen el esquema desde el primer día; no deben presentarse como inferencia real. |
| D5 | `engine_status` reporta `missing` en los tres motores (reglas, bayesiano, ML). | Ningún motor está conectado todavía. Declarar `ok` a un motor que no corrió contradice AGENTS.md ("reportar cuál motor faltó") y la trazabilidad exigida por HU-09/HU-26. Cuando HU-18 conecte la fusión, el estado pasará a `ok`. |
| D6 | El riesgo débil aislado nunca llega a `rojo` (regla de negocio del ejemplo) y la respuesta siempre incluye ≥ 3 factores explicativos. | HU-18 (señal débil aislada nunca es rojo) y HU-20 (≥ 3 factores en lenguaje claro), ya cubiertas por pruebas de caso. |

### Decisiones de integración con el frontend

| # | Decisión | Motivación |
| --- | --- | --- |
| D7 | Los tipos TypeScript se generan con **`openapi-typescript`** sobre el OpenAPI real exportado por el backend (`backend/scripts/export_openapi.py`), no con un parser manual. | El generador anterior escribía interfaces de respaldo escritas a mano cuyo `EvaluationRequest` anidaba `weak_signals`/`strong_indicators`, mientras que el DTO Pydantic usa 19 campos planos: deriva contractual silenciosa. |
| D8 | Si no hay esquema (backend caído, `OPENAPI_PATH` inválido) o el esquema viene vacío/incompleto, el script termina con código ≠ 0. **No existe esquema de respaldo.** | Criterio de diseño 3 del plan: una interfaz vacía no es una generación exitosa. Verificado: sin backend el comando falla con `exit 1`. |
| D9 | El archivo generado lleva cabecera fija **sin marcas de tiempo**, para que la salida sea determinista. | Permite que CI compare con `git diff --exit-code` y detecte deriva real en lugar de diferencias por timestamp. |
| D10 | `apiClient.evaluate()` es un método tipado con `fetch`, que traduce el `detail` de FastAPI (422) a un mensaje legible para el usuario. | HU-17 + AGENTS: manejo amigable de fallos de validación en API y UI. |

### Decisiones de CI y configuración

| # | Decisión | Motivación |
| --- | --- | --- |
| D11 | El job de backend exporta el OpenAPI como **artefacto** y el job de frontend lo consume (`needs: backend`); después se ejecuta `npm run generate:types` y `git diff --exit-code`. | Garantiza que los tipos se deriven del contrato real y fallen si están desactualizados, **sin commits automáticos de bot**. |
| D12 | Se **retiró** `.github/workflows/generate-types.yml`. | Hacía dos cosas prohibidas por el plan: creaba un esquema mínimo ficticio cuando no encontraba OpenAPI y hacía commit automático de los tipos generados. Su función (verificación) quedó en `ci.yml`. |
| D13 | `npm run build` vuelve a ejecutar `tsc --noEmit` sobre `tsconfig.json` y `tsconfig.node.json` antes de `vite build`; se restauró `noEmit` en ambos. | Sin `noEmit`, TypeScript escribía archivos `.js` junto a los `.ts` (`src/App.js`, `tests/App.test.js`…), que Vitest ejecutaba como pruebas duplicadas y rotas. El build además debe ser la puerta que valida los tipos del contrato (T011/T012). |
| D14 | Se restauró la configuración de Vitest dentro de `vite.config.ts` (`environment: "jsdom"`, `setupFiles`, umbrales de cobertura 80 %). | Estaba eliminada: las pruebas de componentes fallaban con `document is not defined` y el umbral de cobertura de AGENTS.md no se aplicaba. |
| D15 | Vitest se actualizó a **v3** (`vitest`/`@vitest/coverage-v8`) junto al Vite 6 del proyecto. | Vitest 2 empaquetaba su propio Vite 5 (`node_modules/vitest/node_modules/vite`), lo que hacía incompatible `defineConfig` de `vitest/config` con `@vitejs/plugin-react` (tipos de Vite 6) y rompía `tsc --noEmit`. |
| D16 | Se añadieron `tsx` (ejecutar el script de generación), `@types/node` (script en Node) y se removió `axios` (ya no se usa). | Dependencias mínimas y coherentes con el uso real. |
| D17 | `openapi.json` exportado y `*.tsbuildinfo` se agregaron a `.gitignore`; los tipos generados **sí** se versionan. | El snapshot del OpenAPI es un artefacto de CI; los tipos son contrato consumido por la UI y deben poder compararse en `git diff`. |
| D18 | La descripción de `POST /api/v1/evaluate` en la OpenAPI declara explícitamente que las probabilidades son **ejemplos de integración** (HU-17) y que `engine_status` reporta `missing` hasta HU-18. | Evita que un consumidor del contrato (frontend, auditor) lea los valores de ejemplo como inferencia real de los motores. |

### Evidencia de pruebas

Ejecutadas el 2026-11-08 en local, sobre el árbol de esta entrega:

| Verificación | Comando | Resultado |
| --- | --- | --- |
| Lint backend | `uv run ruff check .` | ✅ 0 errores (5 corregidos: `UP035`, `UP006` ×2, `UP045`, `B017`) |
| Formato backend | `uv run ruff format --check .` | ✅ 33 archivos formateados (4 de esta entrega reformateados) |
| Pruebas de contrato HU-17 | `uv run pytest tests/test_evaluate_contract.py tests/test_cors.py tests/test_fixtures.py tests/test_health.py` | ✅ **16 passed** (esquema válido/inválido 422, OpenAPI, `/docs`, CORS positivo/negativo, 3 casos de referencia HU-27) |
| Pruebas backend completas | `uv run pytest` (tras `uv sync` con `UV_HTTP_TIMEOUT=600`) | ✅ **43 passed**; cobertura **97,24 %** (gate ≥ 80 %) |
| Servicio vivo | `uv run uvicorn app.main:app` + `GET /openapi.json`, `GET /docs` | ✅ ambas rutas HTTP 200 |
| Generación de tipos contra el backend en ejecución | `npm run generate:types` (sin `OPENAPI_PATH`) | ✅ descarga `http://localhost:8000/openapi.json` y genera 433 líneas; los 19 campos planos del DTO están presentes y no hay `weak_signals` anidado |
| Generación de tipos con esquema real | `OPENAPI_PATH=../backend/openapi.json npm run generate:types` | ✅ genera 433 líneas con los 4 schemas verificados |
| Generación sin esquema | `npm run generate:types` (backend caído) | ✅ **exit 1** con mensaje explícito; no escribe tipos de respaldo |
| Lint frontend | `npm run lint` | ✅ ESLint 0 errores + Prettier OK |
| Pruebas + cobertura frontend | `npm run test:coverage` | ✅ **11 passed**; 100 % Stmts / 100 % Branch / 100 % Funcs (gate ≥ 80 %) |
| Build frontend (type-check + bundle) | `npm run build` | ✅ `tsc` (app + scripts) y `vite build` sin errores |
| Configuración de CI | `yaml.safe_load(.github/workflows/ci.yml)` | ✅ YAML válido; `generate-types.yml` retirado |
| Sincronía de dependencias | `npm ci --dry-run` | ✅ `package.json` y `package-lock.json` conciliados |

### Pendientes de cierre (T014)

- **Aceptación del contrato por Dev 1, Dev 2 y Dev 4:** solicitada como revisión del PR
  `feat/fastapi_service_and_api_contract` → `main`. No se registran aprobaciones que no
  hayan ocurrido; la bitácora se actualiza cuando cada revisor apruebe en GitHub.
- **Revisión independiente y merge:** el PR activa la CI (ruff, pytest ≥ 80 %, generación
  de tipos desde el OpenAPI real con detección de deriva, lint, cobertura frontend ≥ 80 %,
  build con type-check, gitleaks). HU-17 se marca cerrada solo con CI verde + aprobaciones
  + merge a `main`.
- **Siguiente historia:** HU-18 conecta los motores reales (`engines/rules.py`,
  `engines/bayesian.py`, `engines/hybrid.py`) y este servicio deja de ser de ejemplo;
  `engine_status` pasará de `missing` a `ok` motor a motor.
