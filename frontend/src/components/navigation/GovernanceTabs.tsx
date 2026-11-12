import { Link, useLocation } from "react-router-dom";
import { MaterialIcon } from "../MaterialIcon";

interface GovernanceTab {
  to: string;
  label: string;
  icon: string;
}

/**
 * Pestañas de «Gobierno del Sistema» (contratos 01–03).
 *
 * Son la navegación cruzada entre las vistas propias del sistema; el estado
 * activo se deriva de la ruta actual (`aria-current="page"`).
 */
const TABS: GovernanceTab[] = [
  { to: "/arquitectura", label: "Mapa Interactivo", icon: "hub" },
  { to: "/simulador", label: "Simulador de Inferencia", icon: "memory" },
  { to: "/roles", label: "Componentes & Roles", icon: "account_tree" },
];

export function GovernanceTabs(): JSX.Element {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Pestañas de Gobierno del Sistema"
      className="flex items-center gap-8 overflow-x-auto border-b border-outline-variant/60 text-[14px]"
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.to;

        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 border-b-2 py-3 transition-colors ${
              isActive
                ? "border-primary-container font-semibold text-primary-container"
                : "border-transparent font-medium text-slate-500 hover:text-slate-900"
            }`}
          >
            <MaterialIcon
              name={tab.icon}
              className={isActive ? "text-[19px]! text-brand-light" : "text-[18px]!"}
            />
            <span>{tab.label}</span>
            {isActive ? (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-metric-data text-[10px] font-semibold text-primary-container">
                ACTIVO
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
