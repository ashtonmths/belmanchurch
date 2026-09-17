import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { asc, desc, eq } from "drizzle-orm";
import { bethkati, events, massSchedules, priests } from "~/server/db/schema";

export const miscRouter = createTRPCRouter({
  getMassSchedule: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.massSchedules.findMany({
      orderBy: [asc(massSchedules.dayOfWeek), asc(massSchedules.sortOrder)],
    });
  }),
  updateMassSchedule: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          label: z.string().trim().min(2).max(80),
          dayOfWeek: z.number().int().min(0).max(6),
          hour: z.number().int().min(0).max(23),
          minute: z.number().int().min(0).max(59),
          active: z.boolean(),
          sortOrder: z.number().int().min(0),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        for (const item of input) {
          await tx
            .update(massSchedules)
            .set({
              label: item.label,
              dayOfWeek: item.dayOfWeek,
              hour: item.hour,
              minute: item.minute,
              active: item.active,
              sortOrder: item.sortOrder,
              updatedAt: new Date(),
            })
            .where(eq(massSchedules.id, item.id));
        }
        return tx.query.massSchedules.findMany({
          orderBy: [asc(massSchedules.dayOfWeek), asc(massSchedules.sortOrder)],
        });
      });
    }),
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
  getAllPriests: publicProcedure.query(async () => {
    return db.query.priests.findMany({
      columns: {
        id: true,
        name: true,
        role: true,
        period: true,
        imageUrl: true,
        isCurrent: true,
      },
      orderBy: asc(priests.order),
    });
  }),
});
