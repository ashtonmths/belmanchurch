import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(160),
        phone: z.string().trim().max(20).optional(),
        subject: z.string().trim().max(150).optional(),
        message: z.string().trim().min(10).max(4000),
        // Honeypot: hidden from people, usually filled in by bots.
        website: z.string().max(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Everything except the honeypot field.
      const data = {
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      };
      const recent = await ctx.db.contactMessage.count({
        where: {
          email: data.email,
          createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
        },
      });
      if (recent >= 3) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have sent several messages recently. Please try again later.",
        });
      }
      await ctx.db.contactMessage.create({ data });
      return { ok: true };
    }),

  adminList: adminProcedure.query(({ ctx }) =>
    ctx.db.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ),

  unreadCount: adminProcedure.query(({ ctx }) =>
    ctx.db.contactMessage.count({ where: { read: false } }),
  ),

  setRead: adminProcedure
    .input(z.object({ id: z.string(), read: z.boolean() }))
    .mutation(({ ctx, input }) =>
      ctx.db.contactMessage.update({ where: { id: input.id }, data: { read: input.read } }),
    ),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.contactMessage.delete({ where: { id: input.id } })),
});
