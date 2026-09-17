import { inParishTime } from "~/lib/when";
import { ArrowRight, Bell, Pin } from "lucide-react";
import EventCard, { type EventSummary } from "~/components/EventCard";
import Image from "next/image";
import Link from "next/link";
import Reveal from "~/components/home/Reveal";
import type { InfoItem } from "~/lib/site-content";

/** Homepage sections fed by admin-managed data. Server components. */

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] ${
        light ? "text-primary" : "text-accent"
      }`}
    >
      <span className={`h-px w-8 ${light ? "bg-primary" : "bg-accent"}`} aria-hidden />
      {children}
    </p>
  );
}

type Notice = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  pinned: boolean;
  publishedAt: Date;
};

export function NoticesSection({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) {
    return (
      <section aria-labelledby="notices-heading" className="bg-ink px-6 pb-16 pt-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
          <Bell size={22} className="text-primary" aria-hidden />
          <h2 id="notices-heading" className="font-serif text-2xl font-semibold text-cream">
            No notifications for now
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            Announcements from the parish office will appear here. In the meantime, see the Mass
            timings below or the events page.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="notices-heading" className="bg-ink px-6 pb-20 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <h2 id="notices-heading" className="flex items-center gap-2 font-serif text-3xl font-semibold text-cream">
            <Bell size={22} className="text-primary" aria-hidden /> Parish notices
          </h2>
          <Link href="/notices" className="shrink-0 text-sm font-semibold text-primary hover:text-white">
            All notices →
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {notices.map((n, i) => (
            <Reveal key={n.id} delay={i * 0.06}>
              <li className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  {n.pinned && <Pin size={12} aria-label="Pinned" />}
                  {inParishTime(n.publishedAt).format("D MMM YYYY")}
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-white">{n.title}</h3>
                <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {n.body}
                </p>
                {n.link && (
                  <a
                    href={n.link}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-white"
                  >
                    Read more <ArrowRight size={14} aria-hidden />
                  </a>
                )}
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function UpcomingEvents({ events }: { events: EventSummary[] }) {
  return (
    <section className="bg-cream px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow>Coming up</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl font-semibold text-ink md:text-5xl">Upcoming events</h2>
          </div>
          <Link href="/events" className="group inline-flex items-center gap-2 font-semibold text-accent hover:text-ink">
            See all events
            <ArrowRight size={18} className="transition group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>

        {events.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-accent/25 p-10 text-center text-textcolor/70">
            No upcoming events have been announced yet. Check the notices, or visit the Events page for past celebrations.
          </p>
        ) : (
          <ul className="mt-12 flex flex-wrap justify-center gap-6">
            {events.map((e, i) => (
              <Reveal
                key={e.id}
                delay={i * 0.08}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <li className="h-full">
                  <EventCard event={e} />
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Associations({ items }: { items: InfoItem[] }) {
  return (
    <section id="associations" className="scroll-mt-10 bg-[#F3ECE0] px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>Get involved</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold text-ink md:text-5xl">Parish associations</h2>
          <p className="mt-4 text-lg leading-relaxed text-textcolor/90">
            Groups for every age and calling, where parishioners pray, serve and grow together.
          </p>
        </Reveal>
        <ul className="mt-12 flex flex-wrap justify-center gap-5">
          {items.map((a, i) => (
            <Reveal
              key={a.title}
              delay={(i % 3) * 0.06}
              className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
            >
              <li className="flex h-full flex-col rounded-3xl border border-accent/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-2xl font-semibold leading-snug text-ink">{a.title}</h3>
                  {a.badge && (
                    <span className="shrink-0 rounded-full bg-primary/35 px-3 py-1 text-xs font-semibold text-accent">
                      {a.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 hyphens-auto text-justify leading-relaxed text-textcolor/85">{a.body}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Institutions({ items }: { items: InfoItem[] }) {
  return (
    <section className="bg-cream px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Serving through education</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl font-semibold text-ink md:text-5xl">Parish institutions</h2>
            <p className="mt-4 text-lg leading-relaxed text-textcolor/90">
              For well over a century the parish has educated the children of Belman and the surrounding villages.
            </p>
          </div>
          <Link href="/institutions" className="group inline-flex shrink-0 items-center gap-2 font-semibold text-accent hover:text-ink">
            Learn more
            <ArrowRight size={18} className="transition group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <li className="group flex h-full flex-col overflow-hidden rounded-3xl border border-accent/10 bg-white shadow-sm transition hover:shadow-lg">
                {item.imageUrl && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  {item.badge && (
                    <p className="font-serif text-3xl font-semibold text-accent/80">{item.badge}</p>
                  )}
                  <h3 className="mt-1 font-serif text-xl font-semibold leading-snug text-ink">{item.title}</h3>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
