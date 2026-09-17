"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";
import PageShell from "~/components/PageShell";
import { api } from "~/trpc/react";

function getEventDate(date: string | Date) {
  const value = new Date(
    typeof date === "string" ? date.replace(" ", "T") : date,
  );

  return {
    day: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(value),
    month: new Intl.DateTimeFormat("en-IN", {
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(value),
    year: new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(value),
    weekday: new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }).format(value),
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(value),
  };
}

export default function Events() {
  const { data: events, isLoading } = api.misc.getAllEvents.useQuery();
  const now = Date.now();
  const upcomingEvents = events
    ?.filter((event) => new Date(event.date).getTime() >= now)
    .sort(
      (first, second) =>
        new Date(first.date).getTime() - new Date(second.date).getTime(),
    );
  const pastEvents = events
    ?.filter((event) => new Date(event.date).getTime() < now)
    .sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime(),
    );

  return (
    <PageShell contentClassName="mx-auto max-w-5xl">
      <header className="mb-8 border-b border-white/15 pb-7 sm:mb-10 sm:pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Parish events
        </h1>
        <p className="mt-3 text-base text-white/60">
          Upcoming celebrations and gatherings at St. Joseph Church.
        </p>
      </header>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-white/60">
          Loading events…
        </p>
      ) : !events?.length ? (
        <div className="border-b border-t border-white/15 py-14 text-center">
          <CalendarDays className="mx-auto text-[#e9c47d]" size={30} />
          <p className="mt-4 text-lg font-medium text-white">
            No upcoming events
          </p>
          <p className="mt-2 text-sm text-white/55">
            New events will be posted here.
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          <EventSection title="Upcoming" events={upcomingEvents ?? []} />
          {!!pastEvents?.length && (
            <EventSection title="Past events" events={pastEvents} muted />
          )}
        </div>
      )}
    </PageShell>
  );
}

type EventItem = {
  id: string;
  name: string;
  date: Date;
  venue: string;
};

function EventSection({
  title,
  events,
  muted = false,
}: {
  title: string;
  events: EventItem[];
  muted?: boolean;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-3">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          {title}
        </h2>
        <span className="text-sm text-white/45">{events.length}</span>
      </div>
      {events.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const date = getEventDate(event.date);
            return (
              <article
                key={event.id}
                className={`overflow-hidden rounded-2xl border bg-[#211811]/85 ${
                  muted ? "border-white/10 opacity-75" : "border-white/15"
                }`}
              >
                <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4">
                  <div className="min-w-12 text-center">
                    <p className="text-2xl font-semibold leading-none text-[#e9c47d]">
                      {date.day}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-white/55">
                      {date.month}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50">{date.year}</p>
                    <p className="text-sm text-white/70">{date.weekday}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    {event.name}
                  </h3>
                  <div className="mt-5 space-y-3 text-sm text-white/60">
                    <p className="flex items-center gap-2.5">
                      <Clock size={16} className="shrink-0 text-[#e9c47d]" />
                      {date.time}
                    </p>
                    <p className="flex items-start gap-2.5">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-[#e9c47d]"
                      />
                      {event.venue}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-8 text-sm text-white/55">
          No upcoming events have been announced.
        </p>
      )}
    </section>
  );
}
