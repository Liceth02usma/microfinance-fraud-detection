import { Fragment } from "react";
import type { InlineSegment } from "../data/types";

/**
 * Renderiza los segmentos en línea de un párrafo del artículo.
 *
 * Los segmentos son datos (texto plano, negrita, cursiva o monoespaciada) para
 * que el copy sea auditable sin leer JSX; este componente es el único lugar
 * donde se traducen a elementos semánticos.
 */
export function InlineText({ segments }: { segments: InlineSegment[] }): JSX.Element {
  return (
    <>
      {segments.map((segment, index) => {
        if (typeof segment === "string") {
          return <Fragment key={index}>{segment}</Fragment>;
        }
        if ("strong" in segment) {
          return (
            <strong key={index} className="font-semibold text-on-surface">
              {segment.strong}
            </strong>
          );
        }
        if ("em" in segment) {
          return (
            <em key={index} className="italic">
              {segment.em}
            </em>
          );
        }
        return (
          <code key={index} className="font-code-md rounded bg-surface-container px-1">
            {segment.mono}
          </code>
        );
      })}
    </>
  );
}
