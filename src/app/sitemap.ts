import { type MetadataRoute } from "next";
import { SITE_URL } from "~/lib/parish";

/** Public pages only — admin and profile are behind auth and are noindex. */
const ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/events", priority: 0.8 },
  { path: "/gallery", priority: 0.7 },
  { path: "/bethkati", priority: 0.7 },
  { path: "/donate", priority: 0.6 },
  { path: "/shrine", priority: 0.7 },
  { path: "/notices", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/associations", priority: 0.6 },
  { path: "/commissions", priority: 0.6 },
  { path: "/institutions", priority: 0.6 },
  { path: "/tourism", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
