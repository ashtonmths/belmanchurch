import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { asc, eq } from "drizzle-orm";
import { families, parishoners } from "~/server/db/schema";

export const parishonerRouter = createTRPCRouter({
  getParishonerDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      const parishoner = await ctx.db.query.parishoners.findFirst({
        where: eq(parishoners.userId, ctx.session.user.id),
        with: {
          ward: true, // ✅ Include ward details
          family: {
            with: {
              members: true,
              head: true,
            },
          },
        },
      });

      return parishoner ?? null; // ✅ Return `null` instead of throwing an error
    } catch (error) {
      console.error("Error fetching parishoner details:", error);
      return null; // ✅ Ensure backend doesn't crash
    }
  }),
  updateParishoner: adminProcedure
    .input(
      z.object({
        parishonerId: z.string(),
        name: z.string().optional(),
        mobile: z.string().optional(),
        wardId: z.string().optional(), // ✅ Allow ward change
        head: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the parishoner's family ID
      const parishoner = await ctx.db.query.parishoners.findFirst({
        where: eq(parishoners.id, input.parishonerId),
        columns: { familyId: true },
      });

      if (!parishoner) {
        throw new Error("Parishoner not found.");
      }

      if (input.head) {
        if (!parishoner.familyId) {
          throw new Error(
            "Parishoner must belong to a family before being assigned as head.",
          );
        }

        // Directly update the family table to set the new head
        await ctx.db
          .update(families)
          .set({ headId: input.parishonerId })
          .where(eq(families.id, parishoner.familyId));
      } else {
        // If removing the head, set headId to null
        await ctx.db
          .update(families)
          .set({ headId: null })
          .where(eq(families.headId, input.parishonerId));
      }

      // Update the parishoner details without touching familyHead directly
      const [updated] = await ctx.db
        .update(parishoners)
        .set({
          name: input.name,
          mobile: input.mobile,
          wardId: input.wardId,
        })
        .where(eq(parishoners.id, input.parishonerId))
        .returning();
      return updated;
    }),
  addParishoner: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        mobile: z.string().min(10).max(15, "Invalid mobile number"),
        wardId: z.string().optional(),
        familyId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [parishoner] = await ctx.db
        .insert(parishoners)
        .values({
          name: input.name,
          mobile: input.mobile,
          wardId: input.wardId,
          familyId: input.familyId,
        })
        .returning();
      return parishoner;
    }),
  getAllParishoners: adminProcedure.query(({ ctx }) => {
    return ctx.db.query.parishoners.findMany({
      columns: {
        id: true,
        name: true,
        mobile: true,
      },
      with: {
        ward: { columns: { id: true, name: true } },
        family: { columns: { id: true, name: true } },
      },
      orderBy: asc(parishoners.name),
    });
  }),
  assignParishonerToFamily: adminProcedure
    .input(
      z.object({
        parishonerId: z.string(),
        familyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [parishoner] = await ctx.db
        .update(parishoners)
        .set({ familyId: input.familyId })
        .where(eq(parishoners.id, input.parishonerId))
        .returning();
      return parishoner;
    }),
});
