import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const wardRouter = createTRPCRouter({
  /** ✅ Get all wards (sorted by name) */
  getAllWards: protectedProcedure.query(({ ctx }) => {
    return ctx.db.ward.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }),
  getWardById: protectedProcedure
    .input(z.object({ wardId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.ward.findUnique({
        where: { id: input.wardId },
        include: {
          parishoners: { select: { id: true, name: true, mobile: true } },
        },
      });
    }),

  /** ✅ Add a new ward */
  addWard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Ward name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ward.create({
        data: {
          name: input.name,
        },
      });
    }),
});
