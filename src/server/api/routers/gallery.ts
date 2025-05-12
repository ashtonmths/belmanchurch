import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import cloudinary from "cloudinary";
import { db } from "~/server/db";

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
      const { eventName, eventDate, images } = input;

      const cloudinaryFolder = `${eventName} - ${eventDate}`;

      const gallery = await db.gallery.create({
        data: {
          eventName,
          eventDate: new Date(eventDate),
          cloudinaryFolder,
        },
      });

      await db.galleryImage.createMany({
        data: images.map((url) => ({
          url,
          galleryId: gallery.id,
          uploadedById: ctx.session.user.id,
        })),
      });

      return { success: true, cloudinaryFolder };
    }),

  getFolders: publicProcedure.query(async ({}) => {
    const folders = await db.gallery.findMany({
      select: {
        id: true,
        eventName: true,
        eventDate: true,
        cloudinaryFolder: true,
      },
      orderBy: { eventDate: "desc" },
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
            previewImage: sorted[0]?.secure_url ?? null, // First uploaded
          };
        } catch (error) {
          console.error(
            `Error fetching preview for ${folder.cloudinaryFolder}:`,
            error,
          );
          return { ...folder, previewImage: null };
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
      const image = await ctx.db.galleryImage.findUnique({
        where: { id: imageId },
        select: { likedBy: true },
      });

      if (!image) throw new Error("Image not found");

      const updatedLikedBy = image.likedBy.includes(userId)
        ? image.likedBy.filter((id) => id !== userId) // Unlike
        : [...image.likedBy, userId]; // Like

      // Update DB
      await ctx.db.galleryImage.update({
        where: { id: imageId },
        data: { likedBy: updatedLikedBy },
      });

      return {
        likes: updatedLikedBy.length,
        isLiked: updatedLikedBy.includes(userId),
      };
    }),

  getImagesByID: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const gallery = await db.gallery.findFirst({
        where: { id: input.id }, // Find by gallery ID
        select: { id: true },
      });

      if (!gallery) throw new Error("Gallery not found");

      // Fetch images linked to this gallery
      const images = await db.galleryImage.findMany({
        where: { galleryId: gallery.id },
        select: {
          id: true,
          url: true,
          likedBy: true,
          uploadedBy: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
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
