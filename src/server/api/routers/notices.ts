import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const fields = {
  title: z.string().min(3).max(160),
  body: z.string().min(3).max(4000),
  link: z.string().url().or(z.string().regex(/^\//)).nullable().optional(),
  pinned: z.boolean().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
};

const toDate = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? null : new Date(value);

export const noticeRouter = createTRPCRouter({
  /** Published, unexpired notices: pinned first, then newest. */
  listActive: publicProcedure.query(({ ctx }) =>
    ctx.db.notification.findMany({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    }),
  ),

  adminList: adminProcedure.query(({ ctx }) =>
    ctx.db.notification.findMany({ orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }] }),
  ),

  create: adminProcedure
    .input(z.object(fields))
    .mutation(({ ctx, input }) =>
      ctx.db.notification.create({ data: { ...input, expiresAt: toDate(input.expiresAt) } }),
    ),

  update: adminProcedure
    .input(z.object({ id: z.string(), ...fields }).partial({ title: true, body: true }))
    .mutation(({ ctx, input: { id, expiresAt, ...data } }) =>
      ctx.db.notification.update({
        where: { id },
        data: { ...data, expiresAt: toDate(expiresAt) },
      }),
    ),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.notification.delete({ where: { id: input.id } })),
});
