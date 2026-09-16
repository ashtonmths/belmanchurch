/**
 * Single source of truth for parish details.
 *
 * These values are rendered as real page content AND emitted as schema.org
 * structured data, so search engines and the site never disagree.
 */

export const SITE_URL = "https://belmanchurch.in";

type Parish = {
  name: string;
  shortName: string;
  founded: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  address: {
    street: string;
    locality: string;
    district: string;
    region: string;
    postalCode: string;
    country: string;
  };
  geo: { lat: number; lng: number } | null;
};

export const PARISH: Parish = {
  name: "St. Joseph Church, Belman",
  shortName: "Belman Church",
  founded: "1894",
  phone: "+919141031604",
  phoneDisplay: "+91 91410 31604",
  email: "belmanchurch.in@gmail.com",
  // Postal address as published on the parish's earlier website.
  address: {
    street: "Karkala Padubidri Highway (State Highway 1)",
    locality: "Belman",
    district: "Karkala Taluk, Udupi District",
    region: "Karnataka",
    postalCode: "576111",
    country: "IN",
  },
  /** TODO(parish): add { lat, lng } from Google Maps to enable the map pin. */
  geo: null,
};

export type ServiceTime = {
  /** Human label shown on the page. */
  label: string;
  /** Times as displayed to a reader. */
  times: string[];
  /** Optional clarification shown beneath the times. */
  note?: string;
  /**
   * schema.org openingHours-style day tokens for the structured data.
   * Omit for entries that are not a recurring weekly service.
   */
  days?: string[];
};

export const MASS_TIMINGS: ServiceTime[] = [
  {
    label: "Weekday Mass",
    times: ["6:30 AM"],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  {
    label: "Saturday Mass",
    times: ["4:00 PM"],
    days: ["Saturday"],
  },
  {
    label: "Sunday Mass",
    times: ["7:30 AM", "10:30 AM"],
    note: "The 10:30 AM Mass is subject to change, and begins at 10:00 AM when there is no Catechism.",
    days: ["Sunday"],
  },
];

export const OTHER_SERVICES: ServiceTime[] = [
  {
    label: "Catechism",
    times: ["9:15 AM to 10:30 AM"],
    note: "Every Sunday.",
    days: ["Sunday"],
  },
  {
    label: "St. Anthony Shrine, Pakala",
    times: ["4:00 PM"],
    note: "Every Tuesday.",
    days: ["Tuesday"],
  },
];

export const OFFICE_HOURS: ServiceTime = {
  label: "Parish Office",
  times: ["9:00 AM to 1:00 PM", "2:00 PM to 5:00 PM"],
  note: "Closed on Sunday.",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
};

/** Motto inscribed above the altar. */
export const PARISH_MOTTO = { latin: "Ite ad Joseph", english: "Go to Joseph" };

/** Figures from the parish history on the About page. */
export const PARISH_STATS = [
  { value: "1894", label: "Parish founded" },
  { value: "2,156", label: "Parishioners" },
  { value: "581", label: "Families" },
  { value: "21", label: "Wards" },
];

export const PARISH_PRIEST = { name: "Rev. Fr. Oswald Vaz", since: "2025" };

export const LOCATION_DESCRIPTION =
  "48 km north of Mangalore on the State Highway from Padubidri to Kudremukh, between Padubidri and Karkala in Udupi District.";

/** A Maps search rather than hard-coded coordinates, which aren't recorded yet. */
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=St.+Joseph+Church+Belman+576111";

/** Belman takes its name from the Kannada "bili mannu". */
export const NAME_MEANING = { kannada: "bili mannu", english: "white soil" };

export const SHRINE = {
  name: "St. Anthony's Shrine",
  place: "Pakala, Manjarapalke",
  distance: "About 2 km from the church, towards Karkala",
  feast: "13 June",
};

/** Schools run by the parish, with the year each was founded. */
export const PARISH_SCHOOLS = [
  {
    name: "St. Joseph's Higher Primary School",
    founded: "1896",
    note: "Begun in a small mud-and-stone hut on the church campus, when there was no other school nearby.",
  },
  {
    name: "St. Joseph's High School",
    founded: "1982",
    note: "Education in a Christian atmosphere, open to children of every faith.",
  },
  {
    name: "St. Joseph's English Medium School",
    founded: "2012",
    note: "Now teaching from kindergarten through Class 10.",
  },
];
