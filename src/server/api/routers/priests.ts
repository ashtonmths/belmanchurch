import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { imageUrl } from "./carousel";

const role = z.enum(["PARISH_PRIEST", "ASSISTANT_PRIEST"]);

export const priestRouter = createTRPCRouter({
  /** All priests, in historical order within each role. */
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.priest.findMany({ orderBy: [{ role: "asc" }, { order: "asc" }, { createdAt: "asc" }] }),
  ),

  current: publicProcedure.query(({ ctx }) =>
    ctx.db.priest.findMany({
      where: { isCurrent: true },
      orderBy: [{ role: "asc" }, { order: "asc" }],
    }),
  ),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(120),
        role,
        period: z.string().min(2).max(60),
        imageUrl: imageUrl.nullable().optional(),
        isCurrent: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const last = await ctx.db.priest.aggregate({
        where: { role: input.role },
        _max: { order: true },
      });
      return ctx.db.priest.create({ data: { ...input, order: (last._max.order ?? -1) + 1 } });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(120).optional(),
        role: role.optional(),
        period: z.string().min(2).max(60).optional(),
        imageUrl: imageUrl.nullable().optional(),
        isCurrent: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input: { id, ...data } }) => ctx.db.priest.update({ where: { id }, data })),

  move: adminProcedure
    .input(z.object({ id: z.string(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const me = await ctx.db.priest.findUnique({ where: { id: input.id } });
      if (!me) return { ok: false };
      const list = await ctx.db.priest.findMany({
        where: { role: me.role },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
      const i = list.findIndex((p) => p.id === me.id);
      const j = input.direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return { ok: false };
      [list[i], list[j]] = [list[j]!, list[i]!];
      await ctx.db.$transaction(
        list.map((p, order) => ctx.db.priest.update({ where: { id: p.id }, data: { order } })),
      );
      return { ok: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.priest.delete({ where: { id: input.id } })),
});
