import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const parishonerRouter = createTRPCRouter({
  getParishonerDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      const parishoner = await ctx.db.parishoner.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          ward: true, // ✅ Include ward details
          family: {
            include: {
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
  updateParishoner: protectedProcedure
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
      const parishoner = await ctx.db.parishoner.findUnique({
        where: { id: input.parishonerId },
        select: { familyId: true },
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
        await ctx.db.family.update({
          where: { id: parishoner.familyId },
          data: { headId: input.parishonerId },
        });
      } else {
        // If removing the head, set headId to null
        await ctx.db.family.updateMany({
          where: { headId: input.parishonerId },
          data: { headId: null },
        });
      }

      // Update the parishoner details without touching familyHead directly
      return ctx.db.parishoner.update({
        where: { id: input.parishonerId },
        data: {
          name: input.name,
          mobile: input.mobile,
          wardId: input.wardId,
        },
      });
    }),
  addParishoner: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        mobile: z.string().min(10).max(15, "Invalid mobile number"),
        wardId: z.string().optional(),
        familyId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.parishoner.create({
        data: {
          name: input.name,
          mobile: input.mobile,
          ward: input.wardId ? { connect: { id: input.wardId } } : undefined,
          family: input.familyId
            ? { connect: { id: input.familyId } }
            : undefined,
        },
      });
    }),
  getAllParishoners: protectedProcedure.query(({ ctx }) => {
    return ctx.db.parishoner.findMany({
      select: {
        id: true,
        name: true,
        mobile: true,
        ward: { select: { id: true, name: true } }, // Include ward name
        family: { select: { id: true, name: true } }, // Include family name
      },
      orderBy: { name: "asc" },
    });
  }),
  assignParishonerToFamily: protectedProcedure
    .input(
      z.object({
        parishonerId: z.string(),
        familyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.parishoner.update({
        where: { id: input.parishonerId },
        data: { familyId: input.familyId },
      });
    }),
});
