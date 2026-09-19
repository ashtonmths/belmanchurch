import { asc, desc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "~/server/db";
import { galleries, galleryImages, users } from "~/server/db/schema";

export const getCachedGalleryFolders = unstable_cache(
  async () => {
    const folders = await db.query.galleries.findMany({
      columns: {
        id: true,
        eventName: true,
        eventDate: true,
        cloudinaryFolder: true,
        thumbnailUrl: true,
      },
      orderBy: desc(galleries.eventDate),
    });

    const contributorRows = await db
      .selectDistinct({
        galleryId: galleryImages.galleryId,
        id: users.id,
        name: users.name,
        image: users.image,
      })
      .from(galleryImages)
      .innerJoin(users, eq(galleryImages.uploadedById, users.id));

    const missingThumbnailIds = folders
      .filter((folder) => !folder.thumbnailUrl)
      .map((folder) => folder.id);
    const fallbackImages = missingThumbnailIds.length
      ? await db.query.galleryImages.findMany({
          where: inArray(galleryImages.galleryId, missingThumbnailIds),
          columns: { galleryId: true, url: true },
          orderBy: asc(galleryImages.createdAt),
        })
      : [];

    return folders.map((folder) => ({
      id: folder.id,
      eventName: folder.eventName,
      eventDate: folder.eventDate,
      cloudinaryFolder: folder.cloudinaryFolder,
      previewImage:
        folder.thumbnailUrl ??
        fallbackImages.find((image) => image.galleryId === folder.id)?.url ??
        null,
      contributors: contributorRows
        .filter((contributor) => contributor.galleryId === folder.id)
        .map(({ id, name, image }) => ({ id, name, image })),
    }));
  },
  ["public-gallery-folders-v1"],
  { revalidate: 900, tags: ["gallery-folders"] },
);

export const getCachedGalleryImages = unstable_cache(
  async (galleryId: string) => {
    const gallery = await db.query.galleries.findFirst({
      where: eq(galleries.id, galleryId),
      columns: { id: true },
    });
    if (!gallery) return null;

    return db.query.galleryImages.findMany({
      where: eq(galleryImages.galleryId, gallery.id),
      columns: { id: true, url: true, likedBy: true },
      with: {
        uploadedBy: { columns: { id: true, name: true, image: true } },
      },
      orderBy: desc(galleryImages.createdAt),
    });
  },
  ["public-gallery-images-v1"],
  { revalidate: 300, tags: ["gallery-images"] },
);
