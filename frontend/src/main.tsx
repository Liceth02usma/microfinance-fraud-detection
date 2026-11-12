import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { startMockWorker } from "./mocks/browser";

/**
 * Punto de entrada.
 *
 * Si `VITE_USE_MOCKS=true`, primero registra el worker de MSW y después monta
 * la aplicación, de modo que la primera petición ya queda interceptada.
 */
async function bootstrap(): Promise<void> {
  await startMockWorker();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
