import type { ArticleBlock } from "../data/types";
import { InlineText } from "./InlineText";
import { DataTable } from "./blocks/DataTable";
import { FormulaPanel } from "./blocks/FormulaPanel";
import { HighlightCard, InfoCards, NumberedCards, Steps } from "./blocks/InfoCards";
import { ParityMeter } from "./blocks/ParityMeter";
import { StatCards } from "./blocks/StatCards";

/**
 * Traduce un bloque de datos del artículo a su componente visual.
 *
 * Mantener el `switch` aquí (y no dentro de cada sección) garantiza que las 12
 * secciones compartan exactamente la misma tipografía y espaciado.
 */
export function ArticleBlockRenderer({ block }: { block: ArticleBlock }): JSX.Element {
  switch (block.kind) {
    case "abstract":
      return (
        <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/40 bg-surface p-6 text-on-surface-variant shadow-elevation-sm">
          <p className="text-body-md">
            <InlineText segments={block.content.segments} />
          </p>
          <div className="flex flex-wrap gap-2 border-t border-outline-variant/30 pt-2 font-label-md">
            <span className="font-semibold text-on-surface">{block.content.keywordsLabel}</span>
            {block.content.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded bg-brand-soft px-2 py-0.5 font-medium text-primary"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      );

    case "paragraph":
      return (
        <p
          className={
            block.muted
              ? "text-body-sm text-on-surface-variant"
              : "text-body-md leading-relaxed text-on-surface"
          }
        >
          <InlineText segments={block.segments} />
        </p>
      );

    case "quote":
      return (
        <blockquote className="rounded-lg border-l-4 border-primary bg-surface-container-low p-6 font-body-lg italic leading-relaxed text-on-surface">
          <p className="mb-2">{block.text}</p>
          <cite className="block font-label-md font-semibold not-italic text-slate-500">
            {block.cite}
          </cite>
        </blockquote>
      );

    case "stat-cards":
      return <StatCards variant={block.variant} items={block.items} />;

    case "highlight-card":
      return <HighlightCard title={block.title} body={block.body} />;

    case "cards":
      return <InfoCards variant={block.variant} items={block.items} />;

    case "numbered-cards":
      return <NumberedCards items={block.items} />;

    case "steps":
      return <Steps items={block.items} />;

    case "formula":
      return <FormulaPanel content={block.content} />;

    case "table":
      return <DataTable table={block.table} />;

    case "parity-meter":
      return <ParityMeter content={block.content} />;
  }
}
