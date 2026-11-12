import { useRef } from "react";
import { ArticleSectionView } from "../components/ArticleSectionView";
import { MaterialIcon } from "../components/MaterialIcon";
import { ReadingProgress } from "../components/ReadingProgress";
import { SectionIndex } from "../components/SectionIndex";
import { articleHeader, articleSections } from "../data/content";
import { useActiveSection } from "../hooks/useActiveSection";
import { useReadingProgress } from "../hooks/useReadingProgress";

/** Anclas observadas para el resaltado de la sección visible. */
const ARTICLE_ANCHORS: string[] = articleSections.map((section) => section.anchor);

/**
 * Visor del artículo científico: cabecera editorial, las 12 secciones y el
 * índice lateral fijo con el progreso de lectura en vivo.
 */
export function ArticleViewer(): JSX.Element {
  const viewerRef = useRef<HTMLElement | null>(null);
  const progress = useReadingProgress(viewerRef);
  const activeAnchor = useActiveSection(ARTICLE_ANCHORS);

  return (
    <section
      id="visor-articulo"
      ref={viewerRef}
      className="w-full bg-surface-container-lowest py-16 lg:py-20"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:px-12">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <header className="border-b border-outline-variant/30 pb-8">
            <div className="mb-2 flex items-center gap-2 font-label-md font-semibold uppercase tracking-wider text-primary">
              <span className="h-2 w-2 rounded-full bg-brand-light" aria-hidden="true" />
              <span>{articleHeader.kicker}</span>
            </div>
            <h2 className="mb-4 font-display font-bold tracking-tight text-primary text-headline-lg-mobile lg:text-[40px] lg:leading-[48px]">
              {articleHeader.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 font-medium text-body-sm text-slate-500">
              {articleHeader.meta.map((item, index) => (
                <span key={item.text} className="flex items-center gap-1">
                  {index > 0 ? (
                    <span aria-hidden="true" className="mr-1">
                      •
                    </span>
                  ) : null}
                  <MaterialIcon name={item.icon} className="text-[16px]!" />
                  {item.text}
                </span>
              ))}
            </div>
          </header>

          {articleSections.map((section) => (
            <ArticleSectionView key={section.id} section={section} />
          ))}
        </div>

        <aside className="flex w-full flex-col gap-6 lg:sticky lg:top-28 lg:w-[32%] lg:self-start">
          <ReadingProgress progress={progress} />
          <SectionIndex sections={articleSections} activeAnchor={activeAnchor} />
        </aside>
      </div>
    </section>
  );
}
