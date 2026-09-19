import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryBrowser from "~/components/GalleryBrowser";
import { db } from "~/server/db";
import { galleries, galleryImages } from "~/server/db/schema";

type AlbumPageProps = { params: Promise<{ id: string }> };

function getSocialImage(url: string | undefined) {
  if (!url) return undefined;
  return url.includes("res.cloudinary.com") && url.includes("/image/upload/")
    ? url.replace(
        "/image/upload/",
        "/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/",
      )
    : url;
}

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { id } = await params;
  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.id, id),
    columns: {
      id: true,
      eventName: true,
      eventDate: true,
      thumbnailUrl: true,
    },
  });

  if (!gallery) {
    return { title: "Gallery album not found", robots: { index: false } };
  }

  const firstImage = gallery.thumbnailUrl
    ? null
    : await db.query.galleryImages.findFirst({
        where: eq(galleryImages.galleryId, gallery.id),
        columns: { url: true },
        orderBy: asc(galleryImages.createdAt),
      });
  const image = getSocialImage(gallery.thumbnailUrl ?? firstImage?.url);
  const date = gallery.eventDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const title = gallery.eventName;
  const description = `${gallery.eventName}, ${date}. View and download photographs from St. Joseph Church, Belman.`;
  const canonical = `/gallery/${gallery.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              type: "image/jpeg",
              alt: `${gallery.eventName} album thumbnail`,
            },
          ]
        : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function GalleryAlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.id, id),
    columns: { id: true },
  });
  if (!gallery) notFound();
  return <GalleryBrowser initialAlbumId={id} />;
}
