import { CalendarDays } from "lucide-react";
import EventCard from "~/components/EventCard";
import Footer from "~/components/Footer";
import PageHero from "~/components/PageHero";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [upcoming, past] = await Promise.all([
    db.event.findMany({ where: { date: { gte: startOfToday } }, orderBy: { date: "asc" } }),
    db.event.findMany({ where: { date: { lt: startOfToday } }, orderBy: { date: "desc" }, take: 60 }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Parish calendar"
        title="Events"
        description="Feasts, celebrations and gatherings at St. Joseph's, with photos from past events."
        image="/carousel/sunday-mass.jpg"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-4xl font-semibold text-ink">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="mt-6 rounded-3xl border border-dashed border-accent/25 p-10 text-center text-textcolor/70">
              <CalendarDays className="mx-auto mb-3 text-accent" aria-hidden />
              No upcoming events have been announced yet.
            </p>
          ) : (
            <ul className="mt-8 flex flex-wrap justify-center gap-6">
              {upcoming.map((e) => (
                <li key={e.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                  <EventCard event={e} />
                </li>
              ))}
            </ul>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mt-20 font-serif text-4xl font-semibold text-ink">Past events</h2>
              <ul className="mt-8 flex flex-wrap justify-center gap-6">
                {past.map((e) => (
                  <li key={e.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                    <EventCard event={e} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
