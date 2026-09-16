import { MapPin } from "lucide-react";
import Image from "next/image";
import type { InfoItem } from "~/lib/site-content";

/**
 * Card grid for associations, commissions, institutions and places to visit.
 * Cards wrap in a centred row, so a short last row sits in the middle.
 */
export default function InfoGrid({
  items,
  konkani = false,
  grayscale = false,
  placeholder = false,
}: {
  items: InfoItem[];
  /** Offer a "Read in Konkani" toggle on items that have Konkani text. */
  konkani?: boolean;
  /** Show photos in black and white until the card is hovered. */
  grayscale?: boolean;
  /** Give cards without a photo a simple coloured header so every card matches. */
  placeholder?: boolean;
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-5">
      {items.map((item) => (
        <li
          key={item.title}
          className="group flex w-full flex-col overflow-hidden rounded-3xl border border-accent/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
        >
          {item.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className={`object-cover transition duration-500 group-hover:scale-105 ${
                  grayscale ? "grayscale group-hover:grayscale-0" : ""
                }`}
              />
              {item.imageCredit && (
                <a
                  href={item.imageCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 pb-1.5 pt-6 text-right text-[10px] text-white/85 hover:text-white"
                >
                  {item.imageCredit}
                </a>
              )}
            </div>
          ) : (
            placeholder && (
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/50 via-cream to-secondary/40 text-accent">
                <MapPin size={40} aria-hidden />
              </div>
            )
          )}
          <div className="flex flex-1 flex-col p-7">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold leading-snug text-ink">{item.title}</h2>
              {item.badge && (
                <span className="shrink-0 rounded-full bg-primary/35 px-3 py-1 text-xs font-semibold text-accent">
                  {item.badge}
                </span>
              )}
            </div>
            {item.body && (
              <p className="mt-3 hyphens-auto text-justify leading-relaxed text-textcolor/85">{item.body}</p>
            )}
            {konkani && item.bodyKonkani && (
              <details className="group/kok mt-4 rounded-2xl bg-cream/80 p-4 open:bg-cream">
                <summary className="cursor-pointer list-none text-sm font-semibold text-accent marker:hidden">
                  <span className="group-open/kok:hidden">Read in Konkani ›</span>
                  <span className="hidden group-open/kok:inline">Hide Konkani</span>
                </summary>
                <p lang="kok" className="font-konkani mt-3 text-lg leading-loose text-ink">
                  {item.bodyKonkani}
                </p>
              </details>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
