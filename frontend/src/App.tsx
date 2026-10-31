import { useEffect, useState } from "react";
import { apiClient } from "./api/client";

/** Componente raíz. Verifica la conectividad con el backend al montar. */
export default function App() {
  const [status, setStatus] = useState<string>("unknown");

  useEffect(() => {
    apiClient
      .health()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main>
      <h1>CrediConfianza</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}
