import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { apiClient } from "./api/client";
import { AppLayout } from "./components/layout/AppLayout";
import { ArchitectureMapView } from "./views/architecture/ArchitectureMapView";
import { ComponentsRolesView } from "./views/components-roles/ComponentsRolesView";
import { ArticlePage } from "./views/landing/ArticlePage";
import { LandingPage } from "./views/landing/LandingPage";
import SimuladorPage from "./views/simulador/SimuladorPage";
import ValoracionesPage from "./views/valoraciones/ValoracionesPage";

export interface AppRoutesProps {
  /** Estado del backend, mostrado en el pie (píldora técnica). */
  backendStatus: string;
}

/**
 * Rutas de la aplicación. Se monta dentro de un Router (`App` o las pruebas
 * con `MemoryRouter`), de modo que el layout se comparte entre vistas.
 */
export function AppRoutes({ backendStatus }: AppRoutesProps): JSX.Element {
  return (
    <Routes>
      <Route element={<AppLayout backendStatus={backendStatus} />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/articulo" element={<ArticlePage />} />
        <Route path="/arquitectura" element={<ArchitectureMapView />} />
        <Route path="/roles" element={<ComponentsRolesView />} />
        <Route path="/simulador" element={<SimuladorPage />} />
        <Route path="/valoraciones" element={<ValoracionesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

/**
 * Componente raíz.
 *
 * Verifica la conectividad con el backend al montar y la expone al layout
 * compartido (se muestra en el pie como píldora técnica `Backend status`).
 */
export default function App(): JSX.Element {
  const [status, setStatus] = useState<string>("unknown");

  useEffect(() => {
    apiClient
      .health()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes backendStatus={status} />
    </BrowserRouter>
  );
}
