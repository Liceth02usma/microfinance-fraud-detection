import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { articleSections } from "../../src/views/landing/data/content";
import { primaryNavLinks } from "../../src/views/landing/data/site";
import { SiteHeader } from "../../src/views/landing/sections/SiteHeader";

describe("SiteHeader", () => {
  beforeEach(() => {
    render(<SiteHeader />);
  });

  it("expone el desplegable del artículo de forma accesible", () => {
    const trigger = screen.getByRole("button", { name: /Artículo Científico/i });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "article-dropdown");
    // Las 12 secciones solo existen en el DOM cuando el menú está abierto.
    expect(screen.queryByRole("link", { name: articleSections[0].dropdownLabel })).toBeNull();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const links = screen.getAllByRole("link", { name: /^\d{2}\./ });
    expect(links).toHaveLength(articleSections.length);
    expect(links[0]).toHaveAttribute("href", "#articulo-resumen");
  });

  it("cierra el desplegable con Escape y con un clic fuera", () => {
    const trigger = screen.getByRole("button", { name: /Artículo Científico/i });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("cierra el desplegable al elegir una sección", () => {
    const trigger = screen.getByRole("button", { name: /Artículo Científico/i });
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole("link", { name: articleSections[1].dropdownLabel }));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("alterna el menú móvil con su nombre accesible", () => {
    const burger = screen.getByRole("button", { name: /Abrir menú de navegación/i });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", { name: /Navegación principal \(móvil\)/i }),
    ).toBeNull();

    fireEvent.click(burger);

    const mobileNav = screen.getByRole("navigation", { name: /Navegación principal \(móvil\)/i });
    expect(within(mobileNav).getByRole("link", { name: "Simulador" })).toHaveAttribute(
      "href",
      "/simulador",
    );
    expect(within(mobileNav).getAllByRole("link", { name: /^\d{2}\./ })).toHaveLength(
      articleSections.length,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cerrar menú de navegación/i }));
    expect(
      screen.queryByRole("navigation", { name: /Navegación principal \(móvil\)/i }),
    ).toBeNull();
  });

  it("enlaza las tres vistas propias del diseño (contratos 01-03)", () => {
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    for (const navLink of primaryNavLinks) {
      expect(hrefs).toContain(navLink.href);
    }
    expect(primaryNavLinks.map((link) => link.href)).toEqual([
      "/arquitectura",
      "/simulador",
      "/roles",
    ]);
  });
});
