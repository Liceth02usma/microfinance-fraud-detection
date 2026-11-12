import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { articleSections } from "../../src/views/landing/data/content";
import { ArticleViewer } from "../../src/views/landing/sections/ArticleViewer";
import { ReadingProgress } from "../../src/views/landing/components/ReadingProgress";
import { StickyCtaBar } from "../../src/views/landing/sections/StickyCtaBar";

/** Simula la posición vertical de scroll (jsdom no implementa el desplazamiento). */
function setScrollY(value: number): void {
  Object.defineProperty(window, "scrollY", { configurable: true, value, writable: true });
}

describe("ArticleViewer", () => {
  afterEach(() => {
    setScrollY(0);
  });

  it("renderiza el índice temático con las 12 secciones y arranca en 0%", () => {
    render(<ArticleViewer />);

    const index = screen.getByRole("navigation", { name: /Índice temático/i });
    expect(index.querySelectorAll("a")).toHaveLength(articleSections.length);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /Progreso de lectura/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("actualiza el progreso de lectura al desplazarse por el visor", async () => {
    render(<ArticleViewer />);

    const section = document.getElementById("visor-articulo") as HTMLElement;
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      top: -500,
      bottom: 2500,
      height: 3000,
      left: 0,
      right: 1000,
      x: 0,
      y: -500,
      width: 1000,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole("progressbar", { name: /Progreso de lectura/i })).toHaveAttribute(
        "aria-valuenow",
        "22",
      );
    });
    expect(screen.getByText("22%")).toBeInTheDocument();
  });

  it("resalta la sección visible en el índice lateral", async () => {
    render(<ArticleViewer />);

    const article = document.getElementById(articleSections[2].anchor) as HTMLElement;
    vi.spyOn(article, "getBoundingClientRect").mockReturnValue({
      top: -20,
      bottom: 600,
      height: 620,
      left: 0,
      right: 1000,
      x: 0,
      y: -20,
      width: 1000,
      toJSON: () => ({}),
    } as DOMRect);
    // El resto de secciones quedan fuera del área de referencia.
    for (const section of articleSections) {
      if (section.anchor === articleSections[2].anchor) continue;
      vi.spyOn(
        document.getElementById(section.anchor) as HTMLElement,
        "getBoundingClientRect",
      ).mockReturnValue({
        top: 4000,
        bottom: 4600,
        height: 600,
        left: 0,
        right: 1000,
        x: 0,
        y: 4000,
        width: 1000,
        toJSON: () => ({}),
      } as DOMRect);
    }

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: new RegExp(articleSections[2].sidebarLabel) }),
      ).toHaveAttribute("aria-current", "true");
    });
  });
});

describe("ReadingProgress", () => {
  it("expone el porcentaje como valor accesible del progreso", () => {
    render(<ReadingProgress progress={42} />);

    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /Progreso de lectura/i })).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
  });
});

describe("StickyCtaBar", () => {
  beforeEach(() => {
    setScrollY(0);
  });

  // La barra arranca `aria-hidden` (oculta), por eso el enlace se consulta
  // también entre elementos ocultos del árbol de accesibilidad.
  const hiddenCta = (): HTMLElement =>
    screen.getByRole("link", { name: "Probar Simulador Ahora", hidden: true });

  it("permanece oculta por debajo del umbral de scroll", () => {
    render(<StickyCtaBar />);

    const bar = hiddenCta().closest("[aria-hidden]") as HTMLElement;

    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar).toHaveClass("translate-y-full");
  });

  it("aparece al superar los 450px de desplazamiento", () => {
    render(<StickyCtaBar />);

    const bar = hiddenCta().closest("[aria-hidden]") as HTMLElement;

    setScrollY(451);
    fireEvent(window, new Event("scroll"));

    expect(bar).toHaveAttribute("aria-hidden", "false");
    expect(bar).toHaveClass("translate-y-0");
    expect(bar).not.toHaveClass("translate-y-full");
  });
});
