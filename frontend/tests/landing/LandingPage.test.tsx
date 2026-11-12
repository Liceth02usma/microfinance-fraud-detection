import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { articleHeader, articleSections } from "../../src/views/landing/data/content";
import { placeholderSections } from "../../src/views/landing/data/site";
import { LandingPage } from "../../src/views/landing/LandingPage";

describe("LandingPage", () => {
  it("renderiza las secciones del artículo, el hero y las secciones reservadas", () => {
    render(<LandingPage backendStatus="ok" />);

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

    // Secciones reservadas del diseño original (ningún ancla rota).
    for (const placeholder of placeholderSections) {
      const section = document.getElementById(placeholder.id);
      expect(section).not.toBeNull();
      expect(within(section as HTMLElement).getByText(placeholder.title)).toBeInTheDocument();
    }
  });

  it("no tiene enlaces internos apuntando a destinos inexistentes", () => {
    render(<LandingPage backendStatus="ok" />);

    const hrefs = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => href.length > 1);

    const broken = hrefs.filter((href) => document.querySelector(href) === null);

    expect(hrefs.length).toBeGreaterThan(15);
    expect(broken).toEqual([]);
  });

  it("muestra el estado del backend y el enlace de salto accesible en el pie", () => {
    render(<LandingPage backendStatus="ok" />);

    expect(screen.getByText(/Backend status: ok/i)).toBeInTheDocument();

    const skipLink = screen.getByRole("link", { name: /Saltar al contenido principal/i });
    expect(skipLink).toHaveAttribute("href", "#contenido-principal");
    expect(document.getElementById("contenido-principal")).not.toBeNull();
  });
});
