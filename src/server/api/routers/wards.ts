import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { wards } from "~/server/db/schema";

export const wardRouter = createTRPCRouter({
  /** ✅ Get all wards (sorted by name) */
  getAllWards: adminProcedure.query(({ ctx }) => {
    return ctx.db.query.wards.findMany({
      columns: { id: true, name: true },
      orderBy: asc(wards.name),
    });
  }),
  getWardById: adminProcedure
    .input(z.object({ wardId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.wards.findFirst({
        where: eq(wards.id, input.wardId),
        with: {
          parishoners: { columns: { id: true, name: true, mobile: true } },
        },
      });
    }),

  /** ✅ Add a new ward */
  addWard: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Ward name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [ward] = await ctx.db
        .insert(wards)
        .values({ name: input.name })
        .returning();
      return ward;
    }),
});
