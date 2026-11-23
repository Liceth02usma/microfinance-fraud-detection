import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteFooter } from "../../views/landing/sections/SiteFooter";
import { SiteHeader } from "../../views/landing/sections/SiteHeader";
import { StickyCtaBar } from "../../views/landing/sections/StickyCtaBar";

export interface AppLayoutProps {
  /** Estado del backend, mostrado en el pie (píldora técnica). */
  backendStatus: string;
}

/**
 * Layout compartido por todas las rutas: encabezado fijo + contenido + pie.
 *
 * El encabezado y el pie son los mismos de la landing (decisión de producto:
 * no se recrea el chrome propio de cada pantalla de Stitch). La barra flotante
 * «Probar Simulador» solo se muestra en la landing (`/`).
 */
export function AppLayout({ backendStatus }: AppLayoutProps): JSX.Element {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const scrollToTarget = () => {
        const el = document.getElementById(id);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };

      scrollToTarget();
      const timer = setTimeout(scrollToTarget, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main id="contenido-principal" className="pt-20">
        <Outlet />
      </main>
      <SiteFooter backendStatus={backendStatus} />
      {pathname === "/" ? <StickyCtaBar /> : null}
    </div>
  );
}
