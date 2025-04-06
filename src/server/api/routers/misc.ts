import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import cloudinary from "cloudinary";

export const miscRouter = createTRPCRouter({
  // Create Event
  createEvent: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        date: z.string(),
        venue: z.string().min(3),
        info: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          name: input.name,
          date: new Date(input.date),
          venue: input.venue,
          info: input.info ?? null,
        },
      });
    }),

  // Create Bethkati
  createBethkati: protectedProcedure
    .input(
      z.object({
        pdfBase64: z.string(), // PDF as base64
        year: z.number().int().min(2000),
        month: z.string(),
        fileName: z.string(), // useful for naming
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pdfBase64, year, month, fileName } = input;

      const uploadRes = await cloudinary.v2.uploader.upload(`data:application/pdf;base64,${pdfBase64}`, {
        folder: "Bethkati",
        public_id: fileName.replace(/\.pdf$/, ""),
        resource_type: "raw",
      });

      return ctx.db.bethkati.create({
        data: {
          url: uploadRes.secure_url,
          year,
          month,
        },
      });
    }),

  getAllBethkati: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.bethkati.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }),
    getAllEvents: publicProcedure.query(async () => {
      return db.event.findMany({
        orderBy: [{ date: "desc" }],
      })
    })
    
});
