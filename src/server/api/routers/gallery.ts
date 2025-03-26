import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import cloudinary from "cloudinary";
import { db } from "~/server/db";

cloudinary.v2.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export const galleryRouter = createTRPCRouter({
  uploadGallery: protectedProcedure
    .input(
      z.object({
        eventName: z.string(),
        eventDate: z.string(),
        images: z.array(z.string()), // Base64 images
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventName, eventDate, images } = input;

      const cloudinaryFolder = `${eventName} - ${eventDate}`; // Folder name

      // Upload images to Cloudinary
      const uploadedImages = await Promise.all(
        images.map((image) =>
          cloudinary.v2.uploader.upload(image, { folder: cloudinaryFolder }),
        ),
      );

      // Save Gallery entry
      const gallery = await db.gallery.create({
        data: {
          eventName,
          eventDate: new Date(eventDate),
          cloudinaryFolder,
        },
      });

      // Save uploaded images in GalleryImage table
      await db.galleryImage.createMany({
        data: uploadedImages.map((img) => ({
          url: img.secure_url,
          galleryId: gallery.id,
          uploadedById: ctx.session.user.id,
        })),
      });

      return { success: true, cloudinaryFolder };
    }),

  getFolders: protectedProcedure.query(async ({ }) => {
    const folders = await db.gallery.findMany({
      select: {
        id: true,
        eventName: true,
        eventDate: true,
        cloudinaryFolder: true,
      },
      orderBy: { eventDate: "desc" },
    });

    // Fetch first image for each folder
    const folderPreviews = await Promise.all(
      folders.map(async (folder) => {
        try {
          const response = (await cloudinary.v2.api.resources({
            type: "upload",
            prefix: folder.cloudinaryFolder,
            max_results: 1, // Fetch only the first image
          })) as { resources: { secure_url: string }[] };

          return {
            ...folder,
            previewImage: response.resources[0]?.secure_url ?? null, // First image or null
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

  updateLike: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const image = await db.galleryImage.findUnique({
        where: { id: input.imageId },
        select: { likedBy: true, likes: true },
      });

      if (!image) {
        throw new Error("Image not found");
      }

      if (image.likedBy.includes(userId)) {
        throw new Error("You have already liked this image.");
      }

      const updatedImage = await db.galleryImage.update({
        where: { id: input.imageId },
        data: {
          likes: { increment: 1 },
          likedBy: { push: userId }, // Adds userId without overwriting the array
        },
        select: { likes: true },
      });

      return { success: true, likes: updatedImage.likes };
    }),
  getImages: protectedProcedure
    .input(z.object({ folder: z.string() })) // Expect folder name
    .query(async ({ input }) => {
      // Find the gallery by cloudinaryFolder
      const gallery = await db.gallery.findFirst({
        where: { cloudinaryFolder: input.folder }, // Find by folder name
        select: { id: true },
      });

      if (!gallery) {
        throw new Error("Gallery not found");
      }

      // Fetch images linked to this gallery
      const images = await db.galleryImage.findMany({
        where: { galleryId: gallery.id },
        select: {
          id: true,
          url: true,
          likes: true,
          uploadedBy: { select: { id: true, name: true, image: true } }, 
        },
        orderBy: { createdAt: "desc" },
      });

      return images.map((image) => ({
        id: image.id,
        url: image.url,
        likes: image.likes,
        uploadedBy: image.uploadedBy ?? null,
      }));
    }),
});
