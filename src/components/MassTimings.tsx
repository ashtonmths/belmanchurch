import Reveal from "~/components/home/Reveal";
import { PARISH } from "~/lib/parish";
import type { ServiceItem } from "~/lib/site-content";

function ServiceCard({ entry, featured = false }: { entry: ServiceItem; featured?: boolean }) {
  return (
    <div
      className={`flex h-full flex-col rounded-3xl border p-7 text-left transition duration-300 hover:-translate-y-1 ${
        featured
          ? "border-primary/60 bg-primary/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {entry.label}
      </h3>
      <ul className="mt-4 space-y-1">
        {entry.times.map((time) => (
          <li key={time} className="font-serif text-4xl font-semibold text-white">
            {time}
          </li>
        ))}
      </ul>
      {entry.note && (
        <p className="mt-4 text-sm leading-relaxed text-white/55">{entry.note}</p>
      )}
    </div>
  );
}

/**
 * Mass and service times as real, server-rendered page content.
 *
 * This is the most searched-for information about any parish, so it has to
 * exist in the initial HTML — not only behind a click.
 */
export default function MassTimings({
  massTimings,
  otherServices,
}: {
  massTimings: ServiceItem[];
  otherServices: ServiceItem[];
}) {
  return (
    <section
      id="mass-timings"
      aria-labelledby="mass-timings-heading"
      className="scroll-mt-10 bg-ink px-6 py-24 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <span className="h-px w-8 bg-primary" aria-hidden />
              Worship with us
            </p>
            <h2
              id="mass-timings-heading"
              className="mt-5 font-serif text-4xl font-semibold text-white md:text-5xl"
            >
              Mass Timings
            </h2>
          </div>
          <p className="max-w-sm text-white/60">
            Service times at {PARISH.name}. Everyone is welcome.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {massTimings.map((entry, i) => (
            <Reveal key={entry.label} delay={i * 0.08}>
              <ServiceCard entry={entry} featured={entry.label === "Sunday Mass"} />
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {otherServices.map((entry, i) => (
            <Reveal key={entry.label} delay={i * 0.08}>
              <ServiceCard entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
