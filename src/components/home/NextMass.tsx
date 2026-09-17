"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { ServiceItem } from "~/lib/site-content";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3]!.toUpperCase() === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

/** Weekday and minute-of-day at the parish, whatever the visitor's time zone. */
function nowInIndia() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return {
    day: DAYS.indexOf(part("weekday")),
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

type UpcomingMass = {
  label: string;
  time: string;
  dayOffset: number;
  minutesAway: number;
};

function findNextMass(timings: ServiceItem[]): UpcomingMass | null {
  const now = nowInIndia();

  for (let offset = 0; offset < 8; offset++) {
    const dayName = DAYS[(now.day + offset) % 7]!;
    const next = timings
      .filter((entry) => (entry.days as string[] | undefined)?.includes(dayName))
      .flatMap((entry) =>
        entry.times.map((time) => ({
          label: entry.label,
          time,
          minutes: toMinutes(time),
        })),
      )
      .filter(
        (c): c is { label: string; time: string; minutes: number } =>
          c.minutes !== null && (offset > 0 || c.minutes > now.minutes),
      )
      .sort((a, b) => a.minutes - b.minutes)[0];

    if (next) {
      return {
        label: next.label,
        time: next.time,
        dayOffset: offset,
        minutesAway: offset * 1440 + next.minutes - now.minutes,
      };
    }
  }
  return null;
}

function describeDay(mass: UpcomingMass) {
  if (mass.dayOffset === 0) return "Today";
  if (mass.dayOffset === 1) return "Tomorrow";
  const day = (nowInIndia().day + mass.dayOffset) % 7;
  return DAYS[day]!;
}

function describeCountdown(minutes: number) {
  if (minutes >= 12 * 60) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `Starts in ${mins} min`;
  return `Starts in ${hours} h ${mins} min`;
}

/**
 * Live "next Mass" card. Computed on the client only, because the answer
 * depends on the current time and would otherwise mismatch on hydration.
 */
export default function NextMass({ timings }: { timings: ServiceItem[] }) {
  const [mass, setMass] = useState<UpcomingMass | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => {
      setMass(findNextMass(timings));
      setReady(true);
    };
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [timings]);

  const countdown = mass ? describeCountdown(mass.minutesAway) : null;

  return (
    <a
      href="#mass-timings"
      className="group block w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 text-left text-white shadow-2xl backdrop-blur-md transition hover:border-primary/60 hover:bg-white/15"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Next Mass
      </div>

      {ready && mass ? (
        <>
          <p className="mt-3 font-serif text-4xl font-semibold leading-none">
            {mass.time}
          </p>
          <p className="mt-2 text-sm text-white/80">
            {describeDay(mass)} · {mass.label}
          </p>
          {countdown && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
              <Clock size={14} aria-hidden />
              {countdown}
            </p>
          )}
        </>
      ) : (
        <div aria-hidden className="mt-3 space-y-2">
          <div className="h-9 w-32 animate-pulse rounded bg-white/15" />
          <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
        </div>
      )}

      <p className="mt-4 text-xs text-white/60 transition group-hover:text-white/90">
        See all service times →
      </p>
    </a>
  );
}
