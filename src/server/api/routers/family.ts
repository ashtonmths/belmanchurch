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

  // Update Parishoner details (name, phone, ward, head assignment)
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.parishoner.update({
        where: { id: input.parishonerId },
        data: { familyId: input.familyId },
      });
    }),
});