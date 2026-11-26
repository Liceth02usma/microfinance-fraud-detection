import { ArticleViewer } from "./sections/ArticleViewer";

/**
 * Artículo científico (ruta `/articulo`): es el informe del proyecto.
 *
 * Tiene ruta propia para que el desplegable del encabezado y los enlaces del
 * pie (`/articulo#articulo-*`) lleven a la sección correcta desde cualquier
 * vista; el desplazamiento al ancla lo hace `AppLayout`.
 */
export function ArticlePage(): JSX.Element {
  return <ArticleViewer />;
}
