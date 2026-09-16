import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

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
      if (!['ADMIN', 'DEVELOPER', 'PHOTOGRAPHER'].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }
      const { eventName, eventDate, images } = input;

      const cloudinaryFolder = `${eventName} - ${eventDate}`;

      let gallery = await db.gallery.findFirst({
        where: { cloudinaryFolder },
      });

      // If not, create it
      gallery ??= await db.gallery.create({
        data: {
          eventName,
          eventDate: new Date(eventDate),
          cloudinaryFolder,
        },
      });

      // Then insert images into the existing or new gallery
      await db.galleryImage.createMany({
        data: images.map((url) => ({
          url,
          galleryId: gallery.id,
          uploadedById: ctx.session.user.id,
        })),
        skipDuplicates: true,
      });

      return { success: true, cloudinaryFolder };
    }),

  getFolders: publicProcedure.query(async () => {
    // Preview = first uploaded image, read from the database rather than
    // listing Cloudinary, so it works with any storage backend.
    const folders = await db.gallery.findMany({
      select: {
        id: true,
        eventName: true,
        eventDate: true,
        cloudinaryFolder: true,
        images: { select: { url: true }, orderBy: { createdAt: "asc" }, take: 1 },
        _count: { select: { images: true } },
      },
      orderBy: { eventDate: "desc" },
    });

    return folders.map(({ images, _count, ...folder }) => ({
      ...folder,
      previewImage: images[0]?.url ?? null,
      imageCount: _count.images,
    }));
  }),

  deleteImage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.galleryImage.delete({ where: { id: input.id } })),

  deleteGallery: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.gallery.delete({ where: { id: input.id } })),

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
