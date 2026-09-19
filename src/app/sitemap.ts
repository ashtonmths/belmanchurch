import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { db } from "~/server/db";
import { galleries } from "~/server/db/schema";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://belmanchurch.in";
  const albums = await db.query.galleries.findMany({
    columns: { id: true, createdAt: true },
    with: { images: { columns: { createdAt: true } } },
    orderBy: desc(galleries.eventDate),
  });
  const pages = [
    ["", 1, "weekly"],
    ["/about", 0.8, "monthly"],
    ["/events", 0.8, "weekly"],
    ["/gallery", 0.8, "weekly"],
    ["/bethkati", 0.7, "monthly"],
    ["/st-anthony", 0.7, "monthly"],
    ["/contact", 0.6, "yearly"],
    ["/donate", 0.5, "monthly"],
  ] as const;

  return [
    ...pages.map(([path, priority, changeFrequency]) => ({
      url: `${baseUrl}${path}`,
      changeFrequency,
      priority,
    })),
    ...albums.map((album) => ({
      url: `${baseUrl}/gallery/${album.id}`,
      lastModified: album.images.reduce(
        (latest, image) =>
          image.createdAt > latest ? image.createdAt : latest,
        album.createdAt,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
