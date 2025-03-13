import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const familyRouter = createTRPCRouter({
  // ✅ Update Parishoner Mobile
  updateMobile: protectedProcedure
    .input(
      z.object({
        parishonerId: z.string(),
        mobile: z.string().min(10).max(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { parishonerId, mobile } = input;

      await ctx.db.parishoner.update({
        where: { id: parishonerId },
        data: { mobile },
      });

      return { success: true };
    }),

  // ✅ Get All Families with Parishoners
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

  verifyMobile: protectedProcedure
    .input(z.object({ mobile: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const parishoner = await ctx.db.parishoner.findUnique({
        where: { mobile: input.mobile },
      });

      if (!parishoner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mobile number not found. Please enter a valid number.",
        });
      }

      // ✅ Link Parishoner to the User if found
      await ctx.db.parishoner.update({
        where: { id: parishoner.id },
        data: { userId: ctx.session.user.id, name: ctx.session.user.name },
      });

      await ctx.db.user.update({
        where: { id: ctx.session.user.id},
        data: { role: "PARISHONER" }
      })

      return { success: true, message: "Parishoner linked successfully!" };
    }),
});
