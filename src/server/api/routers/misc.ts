import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

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
        pdfUrl: z.string().url(), // directly passing the uploaded PDF URL
        year: z.number().int().min(2000),
        month: z.string(),
        fileName: z.string(), // still useful for logging or display
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pdfUrl, year, month } = input;

      return ctx.db.bethkati.create({
        data: {
          url: pdfUrl,
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
    });
  }),
});
