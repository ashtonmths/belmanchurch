import EventsClient from "./EventsClient";
import { api } from "~/trpc/server";

export const revalidate = 900;

export default async function EventsPage() {
  const events = await api.misc.getAllEvents();
  const upcoming = events.filter((event) => event.date.getTime() >= Date.now());
  const eventJsonLd = upcoming.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.date.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Belman",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Church",
      name: "St. Joseph Church, Belman",
      url: "https://belmanchurch.in",
    },
  }));

  return (
    <>
      {eventJsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      <EventsClient initialEvents={events} />
    </>
  );
}
