import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryBrowser from "~/components/GalleryBrowser";
import {
  getCachedGalleryFolders,
  getCachedGalleryImages,
} from "~/server/gallery-data";

type AlbumPageProps = { params: Promise<{ id: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const folders = await getCachedGalleryFolders();
  return folders.map((folder) => ({ id: folder.id }));
}

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
  const folders = await getCachedGalleryFolders();
  const gallery = folders.find((folder) => folder.id === id);

  if (!gallery) {
    return { title: "Gallery album not found", robots: { index: false } };
  }

  const image = getSocialImage(gallery.previewImage ?? undefined);
  const date = new Date(gallery.eventDate).toLocaleDateString("en-IN", {
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
  const [folders, cachedImages] = await Promise.all([
    getCachedGalleryFolders(),
    getCachedGalleryImages(id),
  ]);
  const gallery = folders.find((folder) => folder.id === id);
  if (!gallery || !cachedImages) notFound();
  const images = cachedImages.map((image) => ({
    id: image.id,
    url: image.url,
    likes: image.likedBy.length,
    uploadedBy: image.uploadedBy ?? null,
    isLiked: null,
  }));
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Gallery",
        item: "https://belmanchurch.in/gallery",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: gallery.eventName,
        item: `https://belmanchurch.in/gallery/${gallery.id}`,
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GalleryBrowser
        initialAlbumId={id}
        initialFolders={folders}
        initialImages={images}
      />
    </>
  );
}
