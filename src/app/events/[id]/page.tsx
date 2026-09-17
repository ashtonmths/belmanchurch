import { inParishTime } from "~/lib/when";
import { ArrowLeft, CalendarPlus, Clock, MapPin } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "~/components/Footer";
import PageHero from "~/components/PageHero";
import PhotoGrid from "~/components/PhotoGrid";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function findEvent(id: string) {
  return db.event.findUnique({ where: { id } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await findEvent((await params).id);
  if (!event) return { title: "Event not found" };
  const cover = event.images[0] ?? (event.image || undefined);
  return {
    title: event.name,
    description: `${event.name}, ${inParishTime(event.date).format("D MMMM YYYY, h:mm A")} at ${event.venue}.`,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

/** Google Calendar "add event" link, assuming a two-hour event. */
function calendarLink(name: string, date: Date, venue: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: name,
    dates: `${fmt(date)}/${fmt(end)}`,
    location: venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventPage({ params }: Props) {
  const event = await findEvent((await params).id);
  if (!event) notFound();

  const photos = (event.images.length ? event.images : event.image ? [event.image] : []).map((src) => ({
    src,
    alt: event.name,
  }));
  const upcoming = event.date >= new Date();

  return (
    <>
      <PageHero
        eyebrow={upcoming ? "Upcoming event" : "Past event"}
        title={event.name}
        image={photos[0]?.src ?? "/carousel/sunday-mass.jpg"}
      />
      <main className="bg-cream px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/events" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-ink">
            <ArrowLeft size={16} aria-hidden /> All events
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              {event.info ? (
                <p className="whitespace-pre-line text-lg leading-relaxed text-textcolor/90">{event.info}</p>
              ) : (
                <p className="text-lg text-textcolor/70">More details will be shared soon.</p>
              )}
            </div>
            <aside className="h-fit rounded-3xl bg-ink p-7 text-cream">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Clock size={14} aria-hidden /> When
              </p>
              <p className="mt-2 font-serif text-2xl font-semibold">{inParishTime(event.date).format("dddd, D MMMM YYYY")}</p>
              <p className="text-cream/70">{inParishTime(event.date).format("h:mm A")}</p>
              <p className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <MapPin size={14} aria-hidden /> Where
              </p>
              <p className="mt-2 font-serif text-xl font-semibold">{event.venue}</p>
              {upcoming && (
                <a
                  href={calendarLink(event.name, event.date, event.venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  <CalendarPlus size={16} aria-hidden /> Add to calendar
                </a>
              )}
            </aside>
          </div>

          {photos.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 font-serif text-3xl font-semibold text-ink">Photos</h2>
              <PhotoGrid photos={photos} />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
