import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  HandHeart,
  Images,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Reveal from "~/components/home/Reveal";
import {
  LOCATION_DESCRIPTION,
  MAPS_URL,
  NAME_MEANING,
  SHRINE,
  PARISH,
  PARISH_MOTTO,
  PARISH_STATS,
} from "~/lib/parish";
import type { ServiceItem } from "~/lib/site-content";

function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] ${
        light ? "text-primary" : "text-accent"
      }`}
    >
      <span
        className={`h-px w-8 ${light ? "bg-primary" : "bg-accent"}`}
        aria-hidden
      />
      {children}
    </p>
  );
}

export function StatsBand() {
  return (
    <section
      aria-label="The parish in numbers"
      className="border-y border-white/10 bg-ink"
    >
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4">
        {PARISH_STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.08}
            className="flex flex-col-reverse items-center text-center"
          >
            <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              {stat.label}
            </dt>
            <dd className="font-serif text-5xl font-semibold text-primary md:text-6xl">
              {stat.value}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

type CurrentPriest = { name: string; role: string; imageUrl: string | null };

/** "Rev. Fr. Oswald Vaz" -> "OV" */
function initials(name: string) {
  const words = name.replace(/^(Rev\.?\s*)?(Fr\.?\s*)/i, "").split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words.at(-1)?.[0] ?? "")).toUpperCase();
}

export function Welcome({ priests }: { priests: CurrentPriest[] }) {
  return (
    <section id="welcome" className="scroll-mt-10 bg-cream px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-accent/30">
            <Image
              src="/bg/admin.jpg"
              alt="The nave and altar of St. Joseph Church, Belman"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
            <p className="absolute bottom-6 left-6 right-6 font-serif text-2xl italic text-white">
              &ldquo;{PARISH_MOTTO.latin}&rdquo;
              <span className="mt-1 block font-sans text-sm not-italic tracking-wide text-white/75">
                {PARISH_MOTTO.english}, inscribed above our altar
              </span>
            </p>
          </div>
          <div
            aria-hidden
            className="absolute -bottom-6 -right-6 -z-10 hidden h-40 w-40 rounded-[2rem] border-2 border-primary md:block"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Welcome</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
            A home for every family, since {PARISH.founded}
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-textcolor/90">
            <p>
              What began as a chapel with mud walls and a thatched roof has
              grown into the spiritual home of 581 families across 21 wards.
            </p>
            <p>
              Belman itself takes its name from the Kannada{" "}
              <em>{NAME_MEANING.kannada}</em>, meaning &ldquo;{NAME_MEANING.english}
              .&rdquo;
            </p>
            <p>
              Whether you are a parishioner, a visitor, or coming home after a
              long time away, you are welcome at St. Joseph&rsquo;s.
            </p>
          </div>

          {priests.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {priests.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center gap-4 rounded-2xl border border-accent/15 bg-white p-4 shadow-sm"
                >
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-full object-cover object-top"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/40 font-serif text-lg font-semibold text-accent"
                    >
                      {initials(p.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                      {p.role === "PARISH_PRIEST" ? "Parish Priest" : "Assistant Parish Priest"}
                    </p>
                    <p className="font-serif text-lg font-semibold leading-snug text-ink">{p.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/history"
            className="group mt-8 inline-flex items-center gap-2 font-semibold text-accent transition hover:text-ink"
          >
            Read our history
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const EXPLORE = [
  {
    href: "/events",
    title: "Events",
    body: "Feasts, celebrations and gatherings across the parish year.",
    Icon: CalendarDays,
  },
  {
    href: "/gallery",
    title: "Gallery",
    body: "Photos from Masses, feasts and parish life.",
    Icon: Images,
  },
  {
    href: "/bethkati",
    title: "Bethkati",
    body: "Read each monthly issue of our parish newsletter.",
    Icon: BookOpen,
  },
  {
    href: "/donate",
    title: "Donate",
    body: "Support the church, the chapel, or offer a Thanksgiving Mass.",
    Icon: HandHeart,
  },
];

export function Explore() {
  return (
    <section className="bg-[#F3ECE0] px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>Parish life</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold text-ink md:text-5xl">
            Stay close to the community
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE.map(({ href, title, body, Icon }, i) => (
            <Reveal key={href} delay={i * 0.08}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-3xl border border-accent/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-xl hover:shadow-accent/15"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/35 text-accent transition group-hover:bg-accent group-hover:text-primary">
                  <Icon size={24} aria-hidden />
                </span>
                <h3 className="mt-6 font-serif text-2xl font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 flex-1 leading-relaxed text-textcolor/80">
                  {body}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  Explore
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteBand() {
  return (
    <section className="relative isolate overflow-hidden bg-accent px-6 py-24 text-center md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(234,198,150,0.35),transparent_60%)]"
      />
      <Reveal className="mx-auto max-w-3xl">
        <span
          aria-hidden
          className="font-serif text-7xl leading-none text-primary/60"
        >
          &ldquo;
        </span>
        <blockquote className="font-serif text-3xl italic leading-snug text-cream md:text-4xl">
          In Joseph &hellip; heads of the household are blessed with the
          unsurpassed model of fatherly watchfulness and care.
        </blockquote>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Pope Leo XIII
        </p>
      </Reveal>
    </section>
  );
}

export function Visit({
  officeHours,
  otherServices,
}: {
  officeHours: ServiceItem;
  otherServices: ServiceItem[];
}) {
  const shrine = otherServices.find((s) => s.label.startsWith("St. Anthony"));

  return (
    <section className="bg-cream px-6 py-24 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Eyebrow>Plan your visit</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold text-ink md:text-5xl">
            Find us in Belman
          </h2>
          <p className="mt-5 flex max-w-xl gap-3 text-lg leading-relaxed text-textcolor/90">
            <MapPin className="mt-1 shrink-0 text-accent" size={22} aria-hidden />
            {LOCATION_DESCRIPTION}
          </p>
          <address className="mt-4 max-w-xl pl-[34px] not-italic leading-relaxed text-ink">
            <span className="block font-semibold">{PARISH.name}</span>
            <span className="block">{PARISH.address.street}</span>
            <span className="block">
              {PARISH.address.locality}, {PARISH.address.district}
            </span>
            <span className="block">
              {PARISH.address.region} {PARISH.address.postalCode}
            </span>
          </address>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-accent"
          >
            Get directions <ArrowRight size={18} aria-hidden />
          </a>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            <li>
              <a
                href={`tel:${PARISH.phone}`}
                className="flex items-center gap-3 rounded-2xl border border-accent/10 bg-white p-4 transition hover:border-primary"
              >
                <Phone className="text-accent" size={20} aria-hidden />
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-accent/70">
                    Call
                  </span>
                  <span className="font-semibold text-ink">
                    {PARISH.phoneDisplay}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${PARISH.email}`}
                className="flex items-center gap-3 rounded-2xl border border-accent/10 bg-white p-4 transition hover:border-primary"
              >
                <Mail className="text-accent" size={20} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.2em] text-accent/70">
                    Email
                  </span>
                  <span className="block truncate font-semibold text-ink">
                    {PARISH.email}
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="space-y-5 lg:col-span-2">
          <div className="rounded-3xl bg-ink p-7 text-cream">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Clock size={16} aria-hidden /> {officeHours.label}
            </p>
            {officeHours.times.map((t) => (
              <p key={t} className="mt-3 font-serif text-2xl font-semibold">
                {t}
              </p>
            ))}
            <p className="mt-2 text-sm text-cream/60">
              Monday to Friday &middot; {officeHours.note}
            </p>
          </div>

          {shrine && (
            <div className="rounded-3xl border border-accent/15 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                Also in the parish
              </p>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">
                {SHRINE.name}, {SHRINE.place}
              </h3>
              <p className="mt-1 text-sm text-accent/80">{SHRINE.distance}</p>
              <p className="mt-3 text-textcolor/90">
                Tuesdays at {shrine.times.join(", ")}.
              </p>
              <p className="mt-3 text-sm font-semibold text-accent">
                Annual feast of St. Anthony &middot; {SHRINE.feast}
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
