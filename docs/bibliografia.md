# Bibliografía

Fuentes utilizadas para las decisiones técnicas del proyecto. Formato **APA 7.ª edición**.
Se indica el uso concreto de cada fuente para que la trazabilidad sea verificable.

## Fuentes del proyecto

FastAPI, Pydantic y las demás librerías se citan en la sección de fuentes técnicas.

Agencia de conocimiento del equipo. (s. f.). *AGENTS.md: reglas de arquitectura, stack y ética del
proyecto CrediConfianza*. Repositorio `microfinance-fraud-detection`. [Archivo interno del repositorio.]

CrediConfianza, equipo de desarrollo. (s. f.). *Backlog de producto: 37 historias de usuario en 7
épicas*. `docs/backlog.md`. [Archivo interno del repositorio.]

CrediConfianza, equipo de desarrollo. (s. f.). *COLLABORATING.md: flujo de ramas, commits y puertas de
calidad*. [Archivo interno del repositorio.]

Liceth Usma. (2026, 8 de noviembre). *Plan de cierre: HU-17 — Servicio FastAPI y contrato de la API*
(Plan de trabajo con trazabilidad REQ/Tarea). `plan.md`. [Archivo interno del repositorio.]

## Fuentes técnicas

FastAPI. (s. f.). *Tutorial — Metadata, Docs, OpenAPI*. FastAPI. https://fastapi.tiangolo.com/tutorial/metadata/

FastAPI. (s. f.). *Tutorial — CORS (Cross-Origin Resource Sharing)*. FastAPI. https://fastapi.tiangolo.com/tutorial/cors/

FastAPI. (s. f.). *Tutorial — Response Model and Response Class*. FastAPI. https://fastapi.tiangolo.com/response-model/

OpenAPI Initiative. (s. f.). *OpenAPI Specification 3.1.0*. https://spec.openapis.org/oas/v3.1.0

Pydantic. (s. f.). *Validation errors*. Pydantic. https://docs.pydantic.dev/latest/errors/

Ruff. (s. f.). *Configuration — Lint rules (`UP`, `B`, `I`)*. Astral. https://docs.astral.sh/ruff/configuration/

openapi-typescript. (s. f.). *Configuring the Generator*. OpenAPI TypeScript. https://openapi-ts.dev/node#configuration

> **Uso en HU-17:** API programática `openapiTS()` y `astToString()`. La firma exacta de
> `OpenAPITSOptions` se verificó contra `frontend/node_modules/openapi-typescript/dist/index.d.ts`
> de la versión instalada (7.13.0): esta versión **no** admite la opción `bannerComment` de versiones
> anteriores, de ahí que la cabecera del archivo generado se componga en el script.

TypeScript. (s. f.). *Compiler Options — `noEmit` y `allowImportingTsExtensions`*. Microsoft.
https://www.typescriptlang.org/tsconfig

Vitest. (s. f.). *Configuring Vitest — `test.environment` y `setupFiles`*. Vitest. https://vitest.dev/config/

> **Uso en HU-17:** restaurar `environment: "jsdom"` y los umbrales de cobertura en
> `frontend/vite.config.ts`, y resolver la incompatibilidad de tipos entre Vitest 2 (Vite 5
> empaquetado) y Vite 6 actualizando a Vitest 3.

MDN Web Docs. (s. f.). *Web APIs — `fetch()`*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch

## Fuentes no consultadas explícitamente

Las guías de migración identificadas en el plan de cierre (HU-17) no resultaron aplicables: no hay
migración de versión de framework en este alcance, solo corrección de configuración y del contrato.
