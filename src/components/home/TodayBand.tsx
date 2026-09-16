import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { liturgicalDay, todayInIndia, type Colour } from "~/lib/liturgical";

/** The colour of the vestments worn on the day. */
const SWATCH: Record<Colour, { hex: string; name: string }> = {
  white: { hex: "#F7F3EC", name: "White" },
  red: { hex: "#B3261E", name: "Red" },
  green: { hex: "#2F7A55", name: "Green" },
  violet: { hex: "#6B4E9B", name: "Violet" },
  rose: { hex: "#E3A0B4", name: "Rose" },
};

/**
 * A band under the carousel saying what the Church celebrates today. It works
 * itself out from the date, so nobody has to keep it up to date.
 */
export default function TodayBand() {
  const today = todayInIndia();
  const day = liturgicalDay(today);
  const swatch = SWATCH[day.colour];
  const rank = day.rank === "Weekday" || day.rank === "Sunday" ? day.season : day.rank;

  return (
    <section
      aria-label="Today in the Church"
      className="border-b border-accent/15 bg-[#F3ECE0] px-6 py-7"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="mt-1.5 h-9 w-9 shrink-0 rounded-full border border-accent/30 shadow-inner"
            style={{ backgroundColor: swatch.hex }}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Today,{" "}
              {today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h2 className="mt-1.5 font-serif text-2xl font-semibold leading-snug text-ink md:text-[1.75rem]">
              {day.title}
            </h2>
            <p className="mt-1 text-sm text-textcolor/75">
              {rank} &middot; {swatch.name} vestments
              {day.note && <span className="italic"> &middot; {day.note}</span>}
            </p>
          </div>
        </div>

        <Link
          href="/#mass-timings"
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-accent/25 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent hover:text-cream sm:self-auto"
        >
          <Clock size={16} aria-hidden />
          Mass timings
          <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
