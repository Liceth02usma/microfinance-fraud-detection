import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { KnowledgeResponse } from "../api/types/evaluation.types";

export type KnowledgeState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: KnowledgeResponse; error: null }
  | { status: "error"; data: null; error: string };

// Caché a nivel de módulo: la base de conocimiento cambia poco y varias vistas
// la piden a la vez (reglas, fusión, árbol de decisión).
let cached: KnowledgeResponse | null = null;
let inflight: Promise<KnowledgeResponse> | null = null;

/** Limpia la caché (pruebas y recarga manual). */
export function resetKnowledgeCache(): void {
  cached = null;
  inflight = null;
}

/**
 * Reglas, pesos de fusión y umbrales que ejecuta el backend (`GET /knowledge`).
 *
 * La interfaz no guarda copias propias de estos valores: así lo que ve el
 * analista coincide siempre con lo que decide el motor.
 */
export function useKnowledge(): KnowledgeState {
  const [state, setState] = useState<KnowledgeState>(
    cached
      ? { status: "ready", data: cached, error: null }
      : { status: "loading", data: null, error: null },
  );

  useEffect(() => {
    if (cached) return;
    let active = true;
    inflight ??= apiClient.knowledge();
    inflight
      .then((data) => {
        cached = data;
        if (active) setState({ status: "ready", data, error: null });
      })
      .catch((err: unknown) => {
        inflight = null;
        const message =
          err instanceof Error ? err.message : "No se pudo cargar la base de conocimiento";
        if (active) setState({ status: "error", data: null, error: message });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
