import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { articleHeader, articleSections } from "../../src/views/landing/data/content";
import { primaryNavLinks } from "../../src/views/landing/data/site";
import { renderRoute } from "../helpers/renderRoute";

describe("LandingPage (ruta /)", () => {
  it("renderiza el hero y las 12 secciones del artículo", () => {
    renderRoute();

    // Hero.
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Detección de Fraude en Microcrédito Rural/i,
      }),
    ).toBeInTheDocument();

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

  it("no renderiza bloques de secciones reservadas", () => {
    renderRoute();

    expect(screen.queryByText(/Sección en preparación/i)).toBeNull();
    expect(document.getElementById("simulador")).toBeNull();
    expect(document.getElementById("arquitectura")).toBeNull();
    expect(document.getElementById("roles")).toBeNull();
  });

  it("no tiene enlaces internos apuntando a destinos inexistentes", () => {
    renderRoute();

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
    // Los cuatro CTA de simulador (hero, encabezado, progreso, barra flotante).
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

    expect(screen.getByRole("link", { name: /Probar Simulador Ahora/i })).toBeInTheDocument();
  });
});
