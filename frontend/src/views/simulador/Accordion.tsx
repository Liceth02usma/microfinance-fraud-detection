import { useId, useState } from "react";
import { MaterialIcon } from "../../components/MaterialIcon";

interface Props {
  /** Título visible del bloque; también es el nombre accesible del botón. */
  title: string;
  icon: string;
  /** Línea de resumen visible con el bloque plegado (o siempre, si se prefiere). */
  summary?: React.ReactNode;
  /** Insignia a la derecha (contador, estado). */
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Bloque plegable accesible (patrón Disclosure de WAI-ARIA): el botón expone
 * `aria-expanded` y controla una región que se oculta con `hidden`, de modo
 * que la información sigue en el DOM pero no satura la vista.
 */
export default function Accordion({
  title,
  icon,
  summary,
  badge,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <MaterialIcon name={icon} className="text-[18px] text-slate-500" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
        </span>
        {badge}
        <MaterialIcon
          name="expand_more"
          className={`text-[20px] text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {summary && !open ? <div className="-mt-1 pb-3 pl-[30px]">{summary}</div> : null}
      <div id={id} hidden={!open} className="pb-4 pl-[30px]">
        {children}
      </div>
    </div>
  );
}
