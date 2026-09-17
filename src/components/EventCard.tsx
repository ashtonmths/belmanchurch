import { inParishTime } from "~/lib/when";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type EventSummary = {
  id: string;
  name: string;
  date: Date;
  venue: string;
  image: string;
  images: string[];
};

export default function EventCard({ event }: { event: EventSummary }) {
  const cover = event.images[0] ?? event.image;
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-accent/10 bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent/15"
    >
      <div className="relative aspect-[16/10] bg-primary/25">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-accent">
            <CalendarDays size={40} aria-hidden />
          </span>
        )}
        <span className="absolute left-4 top-4 rounded-2xl bg-white/95 px-3 py-2 text-center shadow">
          <span className="block font-serif text-2xl font-semibold leading-none text-ink">
            {inParishTime(event.date).format("D")}
          </span>
          <span className="block text-[0.65rem] font-semibold uppercase tracking-widest text-accent">
            {inParishTime(event.date).format("MMM YYYY")}
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-2xl font-semibold text-ink">{event.name}</h3>
        <p className="mt-2 text-sm text-textcolor/80">{inParishTime(event.date).format("dddd, h:mm A")}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-textcolor/70">
          <MapPin size={14} aria-hidden /> {event.venue}
        </p>
        {event.images.length > 1 && (
          <p className="mt-3 text-xs font-semibold text-accent">{event.images.length} photos</p>
        )}
      </div>
    </Link>
  );
}
