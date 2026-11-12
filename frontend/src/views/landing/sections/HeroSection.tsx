import { MaterialIcon } from "../components/MaterialIcon";
import { hero, heroBadges, heroRibbon } from "../data/site";

/**
 * Hero institucional: malla ecológica decorativa, insignias verificables,
 * titular, llamada a la acción y la cinta de métricas cuantitativas.
 */
export function HeroSection(): JSX.Element {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-brand-dark via-primary to-[#05291D] text-on-primary">
      {/* Malla algorítmica ambiental (decorativa) */}
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient cx="50%" cy="40%" id="hero-radial" r="60%">
              <stop offset="0%" stopColor="#218861" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0F2C23" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect fill="url(#hero-radial)" height="800" width="1440" />
          <g fill="none" stroke="#94d4b5" strokeOpacity="0.25" strokeWidth="0.75">
            <circle cx="200" cy="180" r="140" strokeDasharray="4,6" />
            <circle cx="850" cy="240" r="280" strokeDasharray="8,4" />
            <circle cx="1200" cy="400" r="190" />
            <path d="M-100,500 C300,320 600,680 1100,420 C1300,310 1500,480 1600,450" />
            <path d="M100,700 C400,550 750,720 1200,580" />
          </g>
        </svg>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:px-12 lg:py-24">
        {/* Insignias de contexto (sin emojis: punto de color + texto) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {heroBadges.map((badge) => (
            <span
              key={badge.text}
              className="inline-flex items-center gap-1.5 rounded bg-surface-container-lowest/10 px-3 py-1 font-label-md text-label-md tracking-wide text-primary-fixed backdrop-blur-md"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
              {badge.text}
            </span>
          ))}
        </div>

        <div className="flex max-w-5xl flex-col gap-6">
          <div className="inline-flex w-auto shrink-0 flex-wrap items-center gap-2.5 self-start rounded-full bg-surface-container-lowest/10 px-3 py-1 font-label-md font-medium uppercase tracking-wider text-primary-fixed backdrop-blur-md">
            <span className="font-semibold text-primary-fixed">{hero.kicker.left}</span>
            <span className="h-1 w-1 rounded-full bg-brand-light" aria-hidden="true" />
            <span className="text-primary-fixed-dim/90">{hero.kicker.right}</span>
          </div>

          <h1 className="font-display text-display-mobile font-bold tracking-tight text-on-primary lg:text-[54px] lg:leading-[62px]">
            {hero.title}
          </h1>

          <p className="max-w-4xl font-body-lg text-body-lg leading-relaxed text-primary-fixed-dim/90">
            {hero.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href={hero.cta.href}
            className="inline-flex min-h-[48px] items-center justify-center rounded bg-primary-container px-7 font-label-lg text-label-lg text-on-primary shadow-md transition-all duration-200 hover:bg-brand-light"
          >
            <MaterialIcon name={hero.cta.icon} className="mr-2 text-[20px]!" />
            {hero.cta.label}
          </a>
        </div>

        {/* Cinta de métricas cuantitativas */}
        <div className="grid grid-cols-2 gap-4 border-t border-surface-container-lowest/15 pt-6 md:grid-cols-4">
          {heroRibbon.map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="font-label-md uppercase tracking-wider font-medium text-primary-fixed opacity-90">
                {item.label}
              </span>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="font-headline-md text-headline-md font-bold text-on-primary">
                  {item.value}
                </span>
                <span className={`border px-2 py-0.5 font-label-md font-medium ${item.tagClass}`}>
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
