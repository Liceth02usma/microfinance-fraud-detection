import { ArticleViewer } from "./sections/ArticleViewer";
import { HeroSection } from "./sections/HeroSection";
import { SiteFooter } from "./sections/SiteFooter";
import { SiteHeader } from "./sections/SiteHeader";
import { StickyCtaBar } from "./sections/StickyCtaBar";

export interface LandingPageProps {
  /** Estado del backend, mostrado en el pie (píldora técnica). */
  backendStatus: string;
}

/**
 * Landing page de CrediConfianza.
 *
 * Orden heredado del diseño original: encabezado fijo → hero → visor del
 * artículo → pie → barra flotante inferior. Las vistas de arquitectura,
 * simulador y roles se sirven como rutas propias (contratos 01–03).
 */
export function LandingPage({ backendStatus }: LandingPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main id="contenido-principal" className="pt-20">
        <HeroSection />
        <ArticleViewer />
      </main>
      <SiteFooter backendStatus={backendStatus} />
      <StickyCtaBar />
    </div>
  );
}
