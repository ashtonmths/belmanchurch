import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const familyRouter = createTRPCRouter({
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
        where: { id: ctx.session.user.id },
        data: { role: "PARISHONER" },
      });

      return { success: true, message: "Parishoner linked successfully!" };
    }),
  getAllFamilies: protectedProcedure.query(({ ctx }) => {
    return ctx.db.family.findMany({
      select: {
        id: true,
        name: true,
        head: { select: { id: true, name: true } }, // Include Family Head
      },
      orderBy: { name: "asc" },
    });
  }),

  addFamily: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Family name is required"),
        headId: z.string().optional(), // Family Head is optional
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.family.create({
        data: {
          name: input.name,
          head: input.headId ? { connect: { id: input.headId } } : undefined,
        },
      });
    }),

  // Get family members by family ID
  getFamilyMembers: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.parishoner.findMany({
        where: { familyId: input.familyId },
        select: {
          id: true,
          name: true,
          mobile: true,
          ward: { select: { id: true, name: true } },
          familyHead: { select: { id: true } },
        },
        orderBy: { name: "asc" },
      });
    }),
  
});