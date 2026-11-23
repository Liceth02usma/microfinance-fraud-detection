import { Link, useLocation } from "react-router-dom";
import { MaterialIcon } from "../../../components/MaterialIcon";
import { useDisclosure } from "../../../hooks/useDisclosure";
import { articleSections } from "../data/content";
import { primaryNavLinks } from "../data/site";
import { useActiveSection } from "../hooks/useActiveSection";
import logoUrl from "../../../assets/crediconfianza-logo.svg";

/**
 * Anclas observadas para resaltar la sección visible: las 12 secciones del
 * artículo (los enlaces principales apuntan a rutas propias, no a anclas).
 */
const SECTION_IDS: string[] = articleSections.map((section) => section.anchor);

const NAV_LINK_BASE =
  "rounded-lg px-3 py-2 font-label-lg text-label-lg transition-colors duration-150";

/** Estado del enlace de navegación según la ruta actual (`aria-current`). */
function navLinkClasses(isActive: boolean): string {
  return isActive
    ? `${NAV_LINK_BASE} bg-primary-container font-semibold text-on-primary`
    : `${NAV_LINK_BASE} text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface`;
}

/**
 * Encabezado fijo de la página: marca, navegación principal, desplegable de
 * las 12 secciones del artículo y acceso al simulador.
 *
 * El desplegable es accesible por teclado (aria-expanded/aria-controls,
 * cierre con Escape y clic fuera) y por debajo de `xl` la navegación se
 * agrupa en un panel desplegable propio.
 */
export function SiteHeader(): JSX.Element {
  const desktopMenu = useDisclosure();
  const mobileMenu = useDisclosure();
  const activeId = useActiveSection(SECTION_IDS);
  const { pathname } = useLocation();

  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Saltar al contenido principal
      </a>

      <header className="fixed top-0 z-50 w-full bg-surface-container-lowest/90 shadow-elevation-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
          <div className="flex shrink-0 items-center gap-4">
            <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm leading-tight tracking-tight text-primary">
                CrediConfianza
              </span>
              <span className="font-label-md text-label-md font-medium text-secondary">
                Finanzas Responsables
              </span>
            </div>
          </div>

          <nav aria-label="Navegación principal" className="hidden items-center gap-2 xl:flex">
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={navLinkClasses(isActive)}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="relative" ref={desktopMenu.containerRef}>
              <button
                type="button"
                onClick={desktopMenu.toggle}
                aria-expanded={desktopMenu.isOpen}
                aria-controls="article-dropdown"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-label-lg text-label-lg text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low hover:text-on-surface"
              >
                <span>Artículo Científico</span>
                <MaterialIcon
                  name="expand_more"
                  className={`text-[18px]! transition-transform duration-200 ${desktopMenu.isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {desktopMenu.isOpen ? (
                <div id="article-dropdown" className="absolute left-0 top-full w-96 pt-2">
                  <div className="max-h-[768px] overflow-y-auto rounded-xl bg-surface-container-lowest p-2 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.06),0_8px_10px_-6px_rgba(15,23,42,0.04)]">
                    <div className="px-3 py-2 font-label-md font-medium text-slate-500">
                      Secciones metodológicas
                    </div>
                    <ul className="flex flex-col gap-0.5">
                      {articleSections.map((section) => (
                        <li key={section.anchor}>
                          <a
                            href={`#${section.anchor}`}
                            onClick={desktopMenu.close}
                            aria-current={activeId === section.anchor ? "true" : undefined}
                            className={`block truncate rounded-lg px-3 py-2 font-body-sm text-body-sm transition-colors ${
                              activeId === section.anchor
                                ? "bg-brand-soft font-semibold text-primary"
                                : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                            }`}
                          >
                            {section.dropdownLabel}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/simulador"
              className="hidden min-h-[44px] items-center justify-center rounded bg-primary-container px-5 font-label-lg text-label-lg text-on-primary shadow-elevation-sm transition-colors duration-150 hover:bg-brand-light sm:inline-flex"
            >
              Probar Simulador
            </Link>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <MaterialIcon name="person" className="text-[18px]! text-on-primary" />
            </span>
            <button
              type="button"
              onClick={mobileMenu.toggle}
              aria-expanded={mobileMenu.isOpen}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-low xl:hidden"
            >
              <MaterialIcon name={mobileMenu.isOpen ? "close" : "menu"} />
              <span className="sr-only">
                {mobileMenu.isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              </span>
            </button>
          </div>
        </div>

        {mobileMenu.isOpen ? (
          <div
            id="mobile-menu"
            ref={mobileMenu.containerRef}
            className="border-t border-outline-variant/30 bg-surface-container-lowest xl:hidden"
          >
            <nav
              aria-label="Navegación principal (móvil)"
              className="mx-auto flex max-h-[70vh] max-w-7xl flex-col gap-1 overflow-y-auto px-6 py-4"
            >
              {primaryNavLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={mobileMenu.close}
                    aria-current={isActive ? "page" : undefined}
                    className={navLinkClasses(isActive)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/simulador"
                onClick={mobileMenu.close}
                className="mt-1 inline-flex min-h-[44px] items-center justify-center rounded bg-primary-container px-5 font-label-lg text-label-lg text-on-primary hover:bg-brand-light"
              >
                Probar Simulador
              </Link>

              <span className="mt-3 border-t border-outline-variant/30 pt-3 font-label-md font-medium text-slate-500">
                Secciones del artículo
              </span>
              {articleSections.map((section) => (
                <a
                  key={section.anchor}
                  href={`#${section.anchor}`}
                  onClick={mobileMenu.close}
                  className="rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                >
                  {section.dropdownLabel}
                </a>
              ))}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
