import { Link } from "react-router-dom";
import { MaterialIcon } from "../../components/MaterialIcon";
import { ARTICLE_PATH } from "./data/site";
import { HeroSection } from "./sections/HeroSection";

interface Entry {
  to: string;
  icon: string;
  title: string;
  body: string;
}

const ENTRIES: Entry[] = [
  {
    to: ARTICLE_PATH,
    icon: "article",
    title: "Artículo científico",
    body: "El informe del proyecto: problema, método, resultados reales y discusión ética.",
  },
  {
    to: "/simulador",
    icon: "analytics",
    title: "Simulador",
    body: "Evalúa una solicitud, revisa por qué el sistema la clasificó así y guarda tu decisión.",
  },
  {
    to: "/valoraciones",
    icon: "folder_shared",
    title: "Valoraciones",
    body: "Historial de decisiones de los analistas, con descarga en PDF.",
  },
];

/**
 * Portada (ruta `/`): hero y accesos directos a las tres vistas principales.
 * El artículo completo vive en `/articulo`.
 */
export function LandingPage(): JSX.Element {
  return (
    <>
      <HeroSection />
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        <h2 className="mb-6 font-headline-sm text-headline-sm font-bold text-on-surface">
          ¿Qué quieres hacer?
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ENTRIES.map((entry) => (
            <Link
              key={entry.to}
              to={entry.to}
              className="group flex flex-col gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-elevation-sm transition-shadow hover:shadow-md"
            >
              <MaterialIcon name={entry.icon} className="text-[28px]! text-primary" />
              <span className="font-label-lg text-[18px] font-semibold text-on-surface group-hover:text-primary">
                {entry.title}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {entry.body}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
