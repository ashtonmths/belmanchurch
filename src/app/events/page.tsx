"use client";
import { api } from "~/trpc/react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import PageShell from "~/components/PageShell";

function formatDateToIST(date: string | Date) {
  let dateString: string;

  // If the date is a string, replace the space with "T" to make it ISO 8601
  if (typeof date === "string") {
    dateString = date.replace(" ", "T");
  } else {
    // If it's already a Date object, convert it to string
    dateString = date.toISOString();
  }

  // Parse the ISO string and convert to the desired time zone (Asia/Kolkata)
  const dateInIST = new Date(dateString);
  return dateInIST.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Events() {
  const { data: events } = api.misc.getAllEvents.useQuery();

  return (
    <PageShell
      eyebrow="Parish calendar"
      title="Events"
      description="Gather with the parish community for worship, celebrations and upcoming programmes."
    >
      {!events ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center text-white/65 backdrop-blur-md">
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center backdrop-blur-md">
          <CalendarDays className="mx-auto text-[#f0c878]" size={34} />
          <p className="mt-4 text-lg font-semibold">No events scheduled yet</p>
          <p className="mt-2 text-sm text-white/55">Please check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-[#f0c878]/50"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f0c878] text-[#2a1b10]">
                <CalendarDays size={21} />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-white">
                {event.name}
              </h2>
              <div className="mt-5 space-y-3 text-sm text-white/65">
                <p className="flex items-start gap-3">
                  <Clock3
                    className="mt-0.5 shrink-0 text-[#f0c878]"
                    size={17}
                  />
                  {formatDateToIST(event.date)} IST
                </p>
                <p className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 shrink-0 text-[#f0c878]"
                    size={17}
                  />
                  {event.venue}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
