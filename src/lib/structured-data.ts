import {
  MASS_TIMINGS,
  OFFICE_HOURS,
  OTHER_SERVICES,
  PARISH,
  SITE_URL,
  type ServiceTime,
} from "~/lib/parish";

/** "4:00 PM" -> "16:00". Returns null if the input isn't a plain clock time. */
function to24Hour(time: string): string | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;

  const [, rawHour, minute, meridiem] = match;
  let hour = Number(rawHour);
  if (meridiem!.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem!.toUpperCase() === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

/**
 * Turns a displayed time into an opens/closes pair. A single time such as
 * "6:30 AM" is treated as a service start with no stated end.
 */
function toOpeningHours(entry: ServiceTime) {
  if (!entry.days?.length) return [];

  return entry.times.flatMap((time) => {
    const [start, end] = time.split(/\s*(?:[\u2013-]|\bto\b)\s*/i);
    const opens = to24Hour(start ?? "");
    if (!opens) return [];

    const closes = end ? to24Hour(end) : null;

    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: entry.days,
        opens,
        ...(closes ? { closes } : {}),
      },
    ];
  });
}

function describeServices(entries: ServiceTime[]): string {
  return entries
    .map((entry) => `${entry.label}: ${entry.times.join(", ")}`)
    .join(". ");
}

/**
 * schema.org `Church` description of the parish. Fields that aren't recorded
 * in `PARISH` are omitted entirely rather than emitted empty — incomplete
 * structured data is worse than none.
 */
export function parishStructuredData({
  massTimings = MASS_TIMINGS,
  otherServices = OTHER_SERVICES,
  officeHours = OFFICE_HOURS,
}: {
  massTimings?: ServiceTime[];
  otherServices?: ServiceTime[];
  officeHours?: ServiceTime;
} = {}) {
  const { address, geo } = PARISH;

  const postalAddress = {
    "@type": "PostalAddress",
    ...(address.street ? { streetAddress: address.street } : {}),
    addressLocality: address.locality,
    addressRegion: address.region,
    ...(address.postalCode ? { postalCode: address.postalCode } : {}),
    addressCountry: address.country,
  };

  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${SITE_URL}/#church`,
    name: PARISH.name,
    alternateName: PARISH.shortName,
    url: SITE_URL,
    telephone: PARISH.phone,
    email: PARISH.email,
    foundingDate: PARISH.founded,
    address: postalAddress,
    ...(geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: geo.lat,
            longitude: geo.lng,
          },
        }
      : {}),
    description: [
      `${PARISH.name} is a Roman Catholic parish in ${address.locality}, ${address.region}, established in ${PARISH.founded}.`,
      describeServices([...massTimings, ...otherServices]),
    ].join(" "),
    openingHoursSpecification: [
      ...massTimings.flatMap(toOpeningHours),
      ...otherServices.flatMap(toOpeningHours),
      ...toOpeningHours(officeHours),
    ],
  };
}

/** Lets search engines show the site's sections as sitelinks. */
export function siteNavigationStructuredData(
  links: { name: string; href: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: links.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.name,
      url: `${SITE_URL}${link.href}`,
    })),
  };
}
