import { placeholderSections } from "./data/site";
import { ArticleViewer } from "./sections/ArticleViewer";
import { HeroSection } from "./sections/HeroSection";
import { PlaceholderSection } from "./sections/PlaceholderSection";
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
 * artículo → secciones reservadas (arquitectura, simulador, roles) → pie →
 * barra flotante inferior.
 */
export function LandingPage({ backendStatus }: LandingPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main id="contenido-principal" className="pt-20">
        <HeroSection />
        <ArticleViewer />
        {placeholderSections.map((section) => (
          <PlaceholderSection key={section.id} section={section} />
        ))}
      </main>
      <SiteFooter backendStatus={backendStatus} />
      <StickyCtaBar />
    </div>
  );
}
