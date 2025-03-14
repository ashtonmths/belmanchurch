import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
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
        url: z.string().url(),
        year: z.number().int().min(2000), // Assuming Bethkati is published after 2000
        month: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bethkati.create({
        data: {
          url: input.url,
          year: input.year,
          month: input.month,
        },
      });
    }),
    getAllBethkati: publicProcedure.query(async () => {
      return db.bethkati.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });
    }),
    getAllEvents: publicProcedure.query(async () => {
      return db.event.findMany({
        orderBy: [{ date: "desc" }],
      })
    })
    
});
