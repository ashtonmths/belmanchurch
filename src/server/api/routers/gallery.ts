import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import cloudinary from "cloudinary";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { galleries, galleryImages } from "~/server/db/schema";

cloudinary.v2.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export const galleryRouter = createTRPCRouter({
  uploadGallery: protectedProcedure
    .input(
      z.object({
        eventName: z.string(),
        eventDate: z.string(),
        images: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !["ADMIN", "DEVELOPER", "PHOTOGRAPHER"].includes(ctx.session.user.role)
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }
      const { eventName, eventDate, images } = input;

      const cloudinaryFolder = `${eventName} - ${eventDate}`;

      let gallery = await db.query.galleries.findFirst({
        where: eq(galleries.cloudinaryFolder, cloudinaryFolder),
      });

      // If not, create it
      if (!gallery) {
        [gallery] = await db
          .insert(galleries)
          .values({
            eventName,
            eventDate: new Date(eventDate),
            cloudinaryFolder,
          })
          .returning();
      }

      if (!gallery) throw new Error("Failed to create gallery");

      // Then insert images into the existing or new gallery
      if (images.length > 0) {
        await db
          .insert(galleryImages)
          .values(
            images.map((url) => ({
              url,
              galleryId: gallery.id,
              uploadedById: ctx.session.user.id,
            })),
          )
          .onConflictDoNothing({ target: galleryImages.url });
      }

      return { success: true, cloudinaryFolder };
    }),

  getFolders: publicProcedure.query(async ({}) => {
    const folders = await db.query.galleries.findMany({
      columns: {
        id: true,
        eventName: true,
        eventDate: true,
        cloudinaryFolder: true,
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
            ...folder,
            contributors: Array.from(
              new Map(
                folder.images
                  .map((image) => image.uploadedBy)
                  .filter((user) => user !== null)
                  .map((user) => [user.id, user]),
              ).values(),
            ),
            images: undefined,
            previewImage: sorted[0]?.secure_url ?? null, // First uploaded
          };
        } catch (error) {
          console.error(
            `Error fetching preview for ${folder.cloudinaryFolder}:`,
            error,
          );
          return {
            ...folder,
            contributors: Array.from(
              new Map(
                folder.images
                  .map((image) => image.uploadedBy)
                  .filter((user) => user !== null)
                  .map((user) => [user.id, user]),
              ).values(),
            ),
            images: undefined,
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
