import { ArticleViewer } from "./sections/ArticleViewer";
import { HeroSection } from "./sections/HeroSection";

/**
 * Contenido de la landing (ruta `/`): hero + visor del artículo científico.
 *
 * El encabezado fijo, el pie y la barra flotante los aporta el layout
 * compartido (`AppLayout`), que es el que decide mostrar la barra solo en `/`.
 */
export function LandingPage(): JSX.Element {
  return (
    <>
      <HeroSection />
      <ArticleViewer />
    </>
  );
}
