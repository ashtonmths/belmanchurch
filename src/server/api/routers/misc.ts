import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { asc, desc, eq } from "drizzle-orm";
import {
  bethkati,
  events,
  massSchedules,
  priests,
  siteSettings,
} from "~/server/db/schema";

export const miscRouter = createTRPCRouter({
  getMassSchedule: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.massSchedules.findMany({
      orderBy: [asc(massSchedules.dayOfWeek), asc(massSchedules.sortOrder)],
    });
  }),
  getSiteSettings: publicProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "main"),
    });
    return (
      settings ?? {
        id: "main",
        donationEnabled: true,
        catechismEnabled: true,
        updatedAt: new Date(),
      }
    );
  }),
  updateSiteSettings: adminProcedure
    .input(
      z.object({ donationEnabled: z.boolean(), catechismEnabled: z.boolean() }),
    )
    .mutation(async ({ ctx, input }) => {
      const [settings] = await ctx.db
        .insert(siteSettings)
        .values({ id: "main", ...input })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: { ...input, updatedAt: new Date() },
        })
        .returning();
      return settings;
    }),
  updateMassSchedule: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          label: z.string().trim().min(2).max(80),
          dayOfWeek: z.number().int().min(0).max(6),
          scheduleType: z.enum([
            "WEEKDAY",
            "SATURDAY",
            "SUNDAY_ALWAYS",
            "SUNDAY_CATECHISM",
            "SUNDAY_NO_CATECHISM",
          ]),
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
              scheduleType: item.scheduleType,
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
        order: true,
      },
      orderBy: asc(priests.order),
    });
  }),
  createPriest: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(2),
        role: z.enum(["PARISH_PRIEST", "ASSISTANT_PRIEST"]),
        period: z.string().trim().min(2),
        imageUrl: z.string().url().optional().nullable(),
        isCurrent: z.boolean(),
        order: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [priest] = await ctx.db.insert(priests).values(input).returning();
      return priest;
    }),
  updatePriest: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(2),
        role: z.enum(["PARISH_PRIEST", "ASSISTANT_PRIEST"]),
        period: z.string().trim().min(2),
        imageUrl: z.string().url().optional().nullable(),
        isCurrent: z.boolean(),
        order: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input;
      const [priest] = await ctx.db
        .update(priests)
        .set(values)
        .where(eq(priests.id, id))
        .returning();
      return priest;
    }),
  deletePriest: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(priests).where(eq(priests.id, input.id));
      return { success: true };
    }),
});
