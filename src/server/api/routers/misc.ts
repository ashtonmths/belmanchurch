import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { desc } from "drizzle-orm";
import { bethkati, events } from "~/server/db/schema";

export const miscRouter = createTRPCRouter({
  // Create Event
  createEvent: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        date: z.string(),
        venue: z.string().min(3),
        info: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .insert(events)
        .values({
          name: input.name,
          date: new Date(input.date),
          venue: input.venue,
          info: input.info ?? null,
        })
        .returning();
      return event;
    }),

  // Create Bethkati
  createBethkati: adminProcedure
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

      const [entry] = await ctx.db
        .insert(bethkati)
        .values({
          url: pdfUrl,
          year,
          month,
        })
        .returning();
      return entry;
    }),

  getAllBethkati: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.bethkati.findMany({
      orderBy: [desc(bethkati.year), desc(bethkati.month)],
    });
  }),
  getAllEvents: publicProcedure.query(async () => {
    return db.query.events.findMany({
      orderBy: desc(events.date),
    });
  }),
});
