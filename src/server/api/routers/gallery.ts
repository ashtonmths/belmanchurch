import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, ne } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { events, galleries, galleryImages } from "~/server/db/schema";
import {
  getCachedGalleryFolders,
  getCachedGalleryImages,
} from "~/server/gallery-data";

const normalizedName = (value: string) =>
  value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
const dateKey = (value: Date) => value.toISOString().slice(0, 10);

function ensureGalleryRole(role: string) {
  if (!["ADMIN", "DEVELOPER", "PHOTOGRAPHER"].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
  }
}

export const galleryRouter = createTRPCRouter({
  getAdminAlbums: protectedProcedure.query(async ({ ctx }) => {
    ensureGalleryRole(ctx.session.user.role);
    return ctx.db
      .select({
        id: galleries.id,
        eventName: galleries.eventName,
        eventDate: galleries.eventDate,
        cloudinaryFolder: galleries.cloudinaryFolder,
        thumbnailUrl: galleries.thumbnailUrl,
        eventId: galleries.eventId,
        imageCount: count(galleryImages.id),
      })
      .from(galleries)
      .leftJoin(galleryImages, eq(galleryImages.galleryId, galleries.id))
      .groupBy(galleries.id)
      .orderBy(desc(galleries.eventDate));
  }),

  updateAlbum: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        eventName: z.string().trim().min(3).max(120),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        thumbnailUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ensureGalleryRole(ctx.session.user.role);
      const cloudinaryFolder = `${input.eventName} - ${input.eventDate}`;
      await ctx.db.transaction(async (tx) => {
        const album = await tx.query.galleries.findFirst({
          where: eq(galleries.id, input.id),
        });
        if (!album) throw new TRPCError({ code: "NOT_FOUND" });
        const thumbnail = await tx.query.galleryImages.findFirst({
          where: and(
            eq(galleryImages.galleryId, input.id),
            eq(galleryImages.url, input.thumbnailUrl),
          ),
          columns: { id: true },
        });
        if (!thumbnail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Choose a photograph from this album",
          });
        }
        const collision = await tx.query.galleries.findFirst({
          where: and(
            eq(galleries.cloudinaryFolder, cloudinaryFolder),
            ne(galleries.id, input.id),
          ),
          columns: { id: true },
        });
        if (collision) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Another album already uses this name and date",
          });
        }

        await tx
          .update(galleries)
          .set({
            eventName: input.eventName,
            eventDate: new Date(input.eventDate),
            cloudinaryFolder,
            thumbnailUrl: input.thumbnailUrl,
          })
          .where(eq(galleries.id, input.id));

        if (album.eventId) {
          await tx
            .update(events)
            .set({
              name: input.eventName,
              date: new Date(`${input.eventDate}T12:00:00+05:30`),
              image: input.thumbnailUrl,
            })
            .where(eq(events.id, album.eventId));
        }
      });
      revalidateTag("gallery-folders");
      revalidateTag("gallery-images");
      revalidatePath("/gallery");
      revalidatePath(`/gallery/${input.id}`);
      revalidatePath("/events");
      return { success: true };
    }),

  appendImages: protectedProcedure
    .input(
      z.object({
        galleryId: z.string(),
        images: z.array(z.string().url()).min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ensureGalleryRole(ctx.session.user.role);
      const album = await ctx.db.query.galleries.findFirst({
        where: eq(galleries.id, input.galleryId),
        columns: { id: true },
        with: { images: { columns: { id: true } } },
      });
      if (!album) throw new TRPCError({ code: "NOT_FOUND" });
      if (album.images.length + input.images.length > 500) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An album can contain up to 500 photographs",
        });
      }
      await ctx.db
        .insert(galleryImages)
        .values(
          input.images.map((url) => ({
            url,
            galleryId: input.galleryId,
            uploadedById: ctx.session.user.id,
          })),
        )
        .onConflictDoNothing({ target: galleryImages.url });
      revalidateTag("gallery-folders");
      revalidateTag("gallery-images");
      revalidatePath("/gallery");
      revalidatePath(`/gallery/${input.galleryId}`);
      return { success: true };
    }),

  uploadGallery: protectedProcedure
    .input(
      z.object({
        eventName: z.string().trim().min(3).max(120),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        eventId: z.string().optional(),
        images: z.array(z.string().url()).min(1).max(500),
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

        revalidateTag("gallery-folders");
        revalidateTag("gallery-images");
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

  getFolders: publicProcedure.query(() => getCachedGalleryFolders()),

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

      revalidateTag("gallery-images");

      return {
        likes: updatedLikedBy.length,
        isLiked: updatedLikedBy.includes(userId),
      };
    }),

  getImagesByID: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const images = await getCachedGalleryImages(input.id);
      if (!images) throw new TRPCError({ code: "NOT_FOUND" });

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
