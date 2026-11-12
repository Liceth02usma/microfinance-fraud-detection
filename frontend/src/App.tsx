import { useEffect, useState } from "react";
import { apiClient } from "./api/client";
import { LandingPage } from "./views/landing/LandingPage";

/**
 * Componente raíz.
 *
 * Verifica la conectividad con el backend al montar y la expone a la landing
 * (se muestra en el pie como píldora técnica `Backend status`).
 */
export default function App() {
  const [status, setStatus] = useState<string>("unknown");

  useEffect(() => {
    apiClient
      .health()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return <LandingPage backendStatus={status} />;
}
