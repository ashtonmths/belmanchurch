import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { imageUrl } from "./carousel";

const fields = {
  name: z.string().min(3).max(160),
  date: z.string().datetime(),
  venue: z.string().min(2).max(160),
  info: z.string().max(10000).nullable().optional(),
  /** Cover photo; defaults to the first gallery photo. */
  image: imageUrl.or(z.literal("")).optional(),
  images: z.array(imageUrl).max(60).optional(),
};

export const eventRouter = createTRPCRouter({
  /** Upcoming (soonest first) and past (most recent first). */
  list: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const [upcoming, past] = await Promise.all([
      ctx.db.event.findMany({ where: { date: { gte: now } }, orderBy: { date: "asc" } }),
      ctx.db.event.findMany({ where: { date: { lt: now } }, orderBy: { date: "desc" } }),
    ]);
    return { upcoming, past };
  }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const event = await ctx.db.event.findUnique({ where: { id: input.id } });
    if (!event) throw new TRPCError({ code: "NOT_FOUND" });
    return event;
  }),

  create: adminProcedure.input(z.object(fields)).mutation(({ ctx, input }) =>
    ctx.db.event.create({
      data: {
        ...input,
        date: new Date(input.date),
        image: input.image ?? input.images?.[0] ?? "",
        images: input.images ?? [],
      },
    }),
  ),

  update: adminProcedure
    .input(z.object({ id: z.string(), ...fields }).partial({ name: true, date: true, venue: true }))
    .mutation(({ ctx, input: { id, date, ...data } }) =>
      ctx.db.event.update({
        where: { id },
        data: { ...data, ...(date ? { date: new Date(date) } : {}) },
      }),
    ),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.event.delete({ where: { id: input.id } })),
});
