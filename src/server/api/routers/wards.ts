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

  /** ✅ Get ward details by ID (including Gurkar and Parishoners) */
  getWardById: protectedProcedure
    .input(z.object({ wardId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.ward.findUnique({
        where: { id: input.wardId },
        include: {
          gurkar: { select: { id: true, name: true } },
          parishoners: { select: { id: true, name: true, mobile: true } },
        },
      });
    }),

  /** ✅ Add a new ward */
  addWard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Ward name is required"),
        gurkarId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ward.create({
        data: {
          name: input.name,
          gurkar: { connect: { id: input.gurkarId } },
        },
      });
    }),

  /** ✅ Update Ward Gurkar */
  updateWardGurkar: protectedProcedure
    .input(
      z.object({
        wardId: z.string(),
        gurkarId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ward.update({
        where: { id: input.wardId },
        data: { gurkar: { connect: { id: input.gurkarId } } },
      });
    }),
});
