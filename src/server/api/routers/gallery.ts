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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventName, eventDate, images } = input;

      // ✅ Ensure only authorized roles can upload
      if (!["ADMIN", "PHOTOGRAPHERS", "DEVELOPER"].includes(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }

      const cloudinaryFolder = `${eventName} - ${eventDate}`; // Folder name

      // Upload images to Cloudinary
      await Promise.all(
        images.map((image) =>
          cloudinary.v2.uploader.upload(image, { folder: cloudinaryFolder })
        )
      );
      // Save in database
      await db.gallery.create({
        data: {
          eventName,
          eventDate: new Date(eventDate),
          cloudinaryFolder,
        },
      });

      return { success: true, cloudinaryFolder };
    }),
    getAllFolders: protectedProcedure.query(async ({ ctx }) => {
      if (!["ADMIN", "PHOTOGRAPHERS", "DEVELOPER", "PARISHONER"].includes(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }
  
      return await db.gallery.findMany({
        select: {
          id: true,
          eventName: true,
          eventDate: true,
          cloudinaryFolder: true,
        },
        orderBy: { eventDate: "desc" },
      });
    }),
});
