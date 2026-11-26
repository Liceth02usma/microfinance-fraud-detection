import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { articleHeader, articleSections } from "../../src/views/landing/data/content";
import { ARTICLE_PATH, primaryNavLinks } from "../../src/views/landing/data/site";
import { renderRoute } from "../helpers/renderRoute";

describe("LandingPage (ruta /)", () => {
  it("renderiza el hero y los accesos al artículo, el simulador y las valoraciones", () => {
    renderRoute();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Detección de Fraude en Microcrédito Rural/i,
      }),
    ).toBeInTheDocument();
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toContain(ARTICLE_PATH);
    expect(hrefs).toContain("/valoraciones");
    // El artículo ya no se monta en la portada: vive en su propia ruta.
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  it("renderiza las 12 secciones del artículo en /articulo", () => {
    renderRoute([ARTICLE_PATH]);

    // Las 12 secciones del artículo científico.
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(articleSections.length);
    for (const section of articleSections) {
      expect(screen.getByRole("heading", { level: 3, name: section.title })).toBeInTheDocument();
    }

    // Cabecera editorial del visor.
    expect(
      screen.getByRole("heading", { level: 2, name: articleHeader.title }),
    ).toBeInTheDocument();
  });

  it("los enlaces a secciones llevan a /articulo y desplazan hasta el ancla", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderRoute(["/articulo#articulo-resultados"]);
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(document.getElementById("articulo-resultados")).not.toBeNull();
  });

  it("no renderiza bloques de secciones reservadas", () => {
    renderRoute();

    expect(screen.queryByText(/Sección en preparación/i)).toBeNull();
    expect(document.getElementById("simulador")).toBeNull();
    expect(document.getElementById("arquitectura")).toBeNull();
    expect(document.getElementById("roles")).toBeNull();
  });

  it("no tiene enlaces internos apuntando a destinos inexistentes", () => {
    renderRoute([ARTICLE_PATH]);

    const hrefs = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => href.length > 1);

    const broken = hrefs.filter((href) => document.querySelector(href) === null);

    // Enlace de salto + 12 anclas del índice lateral del artículo (los CTA
    // principales apuntan ahora a rutas propias, no a anclas).
    expect(hrefs.length).toBeGreaterThanOrEqual(13);
    expect(broken).toEqual([]);
  });

  it("enlaza las vistas propias de arquitectura, simulador y roles", () => {
    renderRoute();

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    for (const navLink of primaryNavLinks) {
      expect(hrefs).toContain(navLink.href);
    }
    // CTA de simulador: navegación, hero, encabezado, tarjeta y barra flotante.
    expect(hrefs.filter((href) => href === "/simulador").length).toBeGreaterThanOrEqual(4);
  });

  it("muestra el estado del backend y el enlace de salto accesible en el pie", () => {
    renderRoute();

    expect(screen.getByText(/Backend status: ok/i)).toBeInTheDocument();

    const skipLink = screen.getByRole("link", { name: /Saltar al contenido principal/i });
    expect(skipLink).toHaveAttribute("href", "#contenido-principal");
    expect(document.getElementById("contenido-principal")).not.toBeNull();
  });

  it("incluye la barra flotante de CTA solo en la landing", () => {
    renderRoute();

    // La barra queda `aria-hidden` hasta que se hace scroll (patrón del diseño).
    expect(
      screen.getByRole("link", { name: /Probar Simulador Ahora/i, hidden: true }),
    ).toBeInTheDocument();
  });
});
