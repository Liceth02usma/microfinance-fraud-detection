import type { ArticleSection } from "../data/types";
import { ArticleBlockRenderer } from "./ArticleBlockRenderer";

export interface ArticleSectionViewProps {
  section: ArticleSection;
}

/**
 * Una de las 12 secciones del artículo.
 *
 * El `id` del `<article>` corresponde al ancla del desplegable del encabezado
 * (`#articulo-*`) y el del encabezado al ancla del índice lateral
 * (`#seccion-N`), replicando los dos sistemas de anclaje del diseño original.
 */
export function ArticleSectionView({ section }: ArticleSectionViewProps): JSX.Element {
  return (
    <article id={section.anchor} className="flex scroll-mt-28 flex-col gap-4">
      <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
        <h3
          id={section.id}
          className="scroll-mt-28 font-headline-sm text-headline-sm font-bold text-primary"
        >
          {section.title}
        </h3>
      </div>
      {section.blocks.map((block, index) => (
        <ArticleBlockRenderer key={`${section.id}-${index}`} block={block} />
      ))}
    </article>
  );
}
