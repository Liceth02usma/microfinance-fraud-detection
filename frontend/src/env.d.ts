/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend FastAPI. */
  readonly VITE_API_URL?: string;
  /** `"true"` activa los mocks de MSW en desarrollo (T23). */
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
