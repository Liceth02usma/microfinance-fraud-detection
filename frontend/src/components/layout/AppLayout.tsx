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
/**
 * Lleva la vista al ancla (`/articulo#articulo-resultados`) o al inicio de la
 * página al cambiar de ruta. React Router no lo hace solo: sin esto, los
 * enlaces a secciones del artículo desde otra vista no llegaban a la sección.
 */
function useScrollToHash(pathname: string, hash: string): void {
  useEffect(() => {
    if (!hash) {
      window.scrollTo?.({ top: 0 });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let timer = 0;
    // El contenido puede montarse un instante después del cambio de ruta.
    const tryScroll = (): void => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView?.({ behavior: "smooth", block: "start" });
      } else if (attempts < 10) {
        attempts += 1;
        timer = window.setTimeout(tryScroll, 50);
      }
    };
    tryScroll();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
}

export function AppLayout({ backendStatus }: AppLayoutProps): JSX.Element {
  const { pathname, hash } = useLocation();
  useScrollToHash(pathname, hash);

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
