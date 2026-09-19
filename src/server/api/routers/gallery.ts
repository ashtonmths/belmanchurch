import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import cloudinary from "cloudinary";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { asc, desc, eq } from "drizzle-orm";
import { events, galleries, galleryImages } from "~/server/db/schema";

cloudinary.v2.config({ cloudinary_url: process.env.CLOUDINARY_URL });

const normalizedName = (value: string) =>
  value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
const dateKey = (value: Date) => value.toISOString().slice(0, 10);

function ensureGalleryRole(role: string) {
  if (!["ADMIN", "DEVELOPER", "PHOTOGRAPHER"].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
  }
}

export const galleryRouter = createTRPCRouter({
  uploadGallery: protectedProcedure
    .input(
      z.object({
        eventName: z.string().trim().min(3).max(120),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        eventId: z.string().optional(),
        images: z.array(z.string().url()).min(1).max(200),
        thumbnailUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ensureGalleryRole(ctx.session.user.role);
      const { eventName, eventDate, eventId, images, thumbnailUrl } = input;

      const cloudinaryFolder = `${eventName} - ${eventDate}`;
      return ctx.db.transaction(async (tx) => {
        let gallery = await tx.query.galleries.findFirst({
          where: eq(galleries.cloudinaryFolder, cloudinaryFolder),
        });
        const isNewAlbum = !gallery;
        let linkedEventId = eventId ?? gallery?.eventId ?? null;
        let linkedEvent = linkedEventId
          ? await tx.query.events.findFirst({
              where: eq(events.id, linkedEventId),
            })
          : null;

        if (linkedEventId && !linkedEvent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The selected event no longer exists",
          });
        }

        if (!linkedEvent) {
          const allEvents = await tx.query.events.findMany();
          linkedEvent = allEvents.find(
            (event) =>
              normalizedName(event.name) === normalizedName(eventName) &&
              dateKey(event.date) === eventDate,
          );
          linkedEventId = linkedEvent?.id ?? null;
        }

        let eventCreated = false;
        if (!linkedEvent && isNewAlbum) {
          [linkedEvent] = await tx
            .insert(events)
            .values({
              name: eventName,
              date: new Date(`${eventDate}T12:00:00+05:30`),
              venue: "St. Joseph Church, Belman",
              info: "Photographs are available in the parish gallery.",
              image: thumbnailUrl,
            })
            .returning();
          linkedEventId = linkedEvent?.id ?? null;
          eventCreated = true;
        }

        if (linkedEvent) {
          await tx
            .update(events)
            .set({ image: thumbnailUrl })
            .where(eq(events.id, linkedEvent.id));
        }

        if (!gallery) {
          [gallery] = await tx
            .insert(galleries)
            .values({
              eventName,
              eventDate: new Date(eventDate),
              cloudinaryFolder,
              thumbnailUrl,
              eventId: linkedEventId,
            })
            .returning();
        } else {
          [gallery] = await tx
            .update(galleries)
            .set({ thumbnailUrl, eventId: linkedEventId })
            .where(eq(galleries.id, gallery.id))
            .returning();
        }

        if (!gallery) throw new Error("Failed to create gallery");

        await tx
          .insert(galleryImages)
          .values(
            images.map((url) => ({
              url,
              galleryId: gallery.id,
              uploadedById: ctx.session.user.id,
            })),
          )
          .onConflictDoNothing({ target: galleryImages.url });

        return { success: true, cloudinaryFolder, eventCreated };
      });
    }),

  getPendingEvents: protectedProcedure.query(async ({ ctx }) => {
    ensureGalleryRole(ctx.session.user.role);
    const [scheduledEvents, albums] = await Promise.all([
      ctx.db.query.events.findMany({ orderBy: asc(events.date) }),
      ctx.db.query.galleries.findMany({
        columns: { eventId: true, eventName: true, eventDate: true },
      }),
    ]);
    return scheduledEvents
      .filter(
        (event) =>
          !albums.some(
            (album) =>
              album.eventId === event.id ||
              (normalizedName(album.eventName) === normalizedName(event.name) &&
                dateKey(album.eventDate) === dateKey(event.date)),
          ),
      )
      .slice(0, 12);
  }),

  getFolders: publicProcedure.query(async ({}) => {
    const folders = await db.query.galleries.findMany({
      columns: {
        id: true,
        eventName: true,
        eventDate: true,
        cloudinaryFolder: true,
        thumbnailUrl: true,
      },
      with: {
        images: {
          columns: { uploadedById: true },
          with: {
            uploadedBy: { columns: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: desc(galleries.eventDate),
    });

    const folderPreviews = await Promise.all(
      folders.map(async (folder) => {
        const contributors = Array.from(
          new Map(
            folder.images
              .map((image) => image.uploadedBy)
              .filter((user) => user !== null)
              .map((user) => [user.id, user]),
          ).values(),
        );
        const album = {
          id: folder.id,
          eventName: folder.eventName,
          eventDate: folder.eventDate,
          cloudinaryFolder: folder.cloudinaryFolder,
          contributors,
        };

        if (folder.thumbnailUrl) {
          return { ...album, previewImage: folder.thumbnailUrl };
        }

        try {
          const response = (await cloudinary.v2.api.resources({
            type: "upload",
            prefix: folder.cloudinaryFolder,
            max_results: 100, // Ensure you get enough to sort
          })) as { resources: { secure_url: string; created_at: string }[] };

          const sorted = response.resources.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );

          return {
            ...album,
            previewImage: sorted[0]?.secure_url ?? null,
          };
        } catch (error) {
          console.error(
            `Error fetching preview for ${folder.cloudinaryFolder}:`,
            error,
          );
          return {
            ...album,
            previewImage: null,
          };
        }
      }),
    );

    return folderPreviews;
  }),

  toggleLike: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { imageId } = input;
      const userId = ctx.session.user.id;

      // Fetch image
      const image = await ctx.db.query.galleryImages.findFirst({
        where: eq(galleryImages.id, imageId),
        columns: { likedBy: true },
      });

      if (!image) throw new Error("Image not found");

      const updatedLikedBy = image.likedBy.includes(userId)
        ? image.likedBy.filter((id) => id !== userId) // Unlike
        : [...image.likedBy, userId]; // Like

      // Update DB
      await ctx.db
        .update(galleryImages)
        .set({ likedBy: updatedLikedBy })
        .where(eq(galleryImages.id, imageId));

      return {
        likes: updatedLikedBy.length,
        isLiked: updatedLikedBy.includes(userId),
      };
    }),

  getImagesByID: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const gallery = await db.query.galleries.findFirst({
        where: eq(galleries.id, input.id),
        columns: { id: true },
      });

      if (!gallery) throw new Error("Gallery not found");

      // Fetch images linked to this gallery
      const images = await db.query.galleryImages.findMany({
        where: eq(galleryImages.galleryId, gallery.id),
        columns: {
          id: true,
          url: true,
          likedBy: true,
        },
        with: {
          uploadedBy: { columns: { id: true, name: true, image: true } },
        },
        orderBy: desc(galleryImages.createdAt),
      });

      const userId = ctx.session?.user?.id;

      return images.map((image) => ({
        id: image.id,
        url: image.url,
        likes: image.likedBy.length,
        uploadedBy: image.uploadedBy ?? null,
        isLiked: userId ? image.likedBy.includes(userId) : null,
      }));
    }),
});
