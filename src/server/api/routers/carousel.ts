import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/** Local paths (/uploads/..., /carousel/...) or https URLs (Cloudinary). */
export const imageUrl = z.string().regex(/^(\/|https:\/\/)/, "Must be an uploaded image");

export const carouselRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.carouselSlide.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ),

  adminList: adminProcedure.query(({ ctx }) =>
    ctx.db.carouselSlide.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ),

  create: adminProcedure
    .input(
      z.object({
        imageUrl,
        title: z.string().max(120).optional(),
        subtitle: z.string().max(240).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const last = await ctx.db.carouselSlide.aggregate({ _max: { order: true } });
      return ctx.db.carouselSlide.create({
        data: { ...input, order: (last._max.order ?? -1) + 1 },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        imageUrl: imageUrl.optional(),
        title: z.string().max(120).nullable().optional(),
        subtitle: z.string().max(240).nullable().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input: { id, ...data } }) =>
      ctx.db.carouselSlide.update({ where: { id }, data }),
    ),

  move: adminProcedure
    .input(z.object({ id: z.string(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const slides = await ctx.db.carouselSlide.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
      const i = slides.findIndex((s) => s.id === input.id);
      const j = input.direction === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= slides.length) return { ok: false };
      [slides[i], slides[j]] = [slides[j]!, slides[i]!];
      await ctx.db.$transaction(
        slides.map((s, order) =>
          ctx.db.carouselSlide.update({ where: { id: s.id }, data: { order } }),
        ),
      );
      return { ok: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.carouselSlide.delete({ where: { id: input.id } })),
});
