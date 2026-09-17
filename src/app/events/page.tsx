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
        <div className="divide-y divide-white/15 border-b border-t border-white/15">
          {events.map((event) => {
            const date = getEventDate(event.date);

            return (
              <article
                key={event.id}
                className="grid gap-5 py-6 sm:grid-cols-[6rem_1fr] sm:gap-8 sm:py-8"
              >
                <div className="flex items-baseline gap-2 sm:block sm:border-r sm:border-white/15 sm:pr-8 sm:text-center">
                  <p className="text-3xl font-semibold leading-none text-[#e9c47d] sm:text-4xl">
                    {date.day}
                  </p>
                  <p className="text-sm font-medium uppercase tracking-wide text-white/60 sm:mt-2">
                    {date.month} {date.year}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-medium text-white sm:text-2xl">
                    {event.name}
                  </h2>
                  <div className="mt-4 flex flex-col gap-2 text-sm text-white/60 sm:flex-row sm:flex-wrap sm:gap-x-6">
                    <p className="flex items-center gap-2">
                      <Clock size={16} className="text-[#e9c47d]" />
                      {date.weekday}, {date.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#e9c47d]" />
                      {event.venue}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
