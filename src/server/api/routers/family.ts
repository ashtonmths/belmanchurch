import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { families, parishoners, users } from "~/server/db/schema";

export const familyRouter = createTRPCRouter({
  updateMobile: protectedProcedure
    .input(
      z.object({
        parishonerId: z.string(),
        mobile: z.string().min(10).max(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !["ADMIN", "DEVELOPER", "PARISHONER"].includes(ctx.session.user.role)
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }
      const { parishonerId, mobile } = input;

      await ctx.db
        .update(parishoners)
        .set({ mobile })
        .where(eq(parishoners.id, parishonerId));

      return { success: true };
    }),

  verifyMobile: protectedProcedure
    .input(z.object({ mobile: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const parishoner = await ctx.db.query.parishoners.findFirst({
        where: eq(parishoners.mobile, input.mobile),
      });

      if (!parishoner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mobile number not found. Please enter a valid number.",
        });
      }

      // ✅ Link Parishoner to the User if found
      await ctx.db
        .update(parishoners)
        .set({
          userId: ctx.session.user.id,
          name: ctx.session.user.name,
        })
        .where(eq(parishoners.id, parishoner.id));

      await ctx.db
        .update(users)
        .set({ role: "PARISHONER" })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true, message: "Parishoner linked successfully!" };
    }),
  getAllFamilies: adminProcedure.query(({ ctx }) => {
    return ctx.db.query.families.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: { head: { columns: { id: true, name: true } } },
      orderBy: asc(families.name),
    });
  }),

  addFamily: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Family name is required"),
        headId: z.string().optional(), // Family Head is optional
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [family] = await ctx.db
        .insert(families)
        .values({
          name: input.name,
          headId: input.headId,
        })
        .returning();
      return family;
    }),

  // Get family members by family ID
  getFamilyMembers: adminProcedure
    .input(z.object({ familyId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.parishoners.findMany({
        where: eq(parishoners.familyId, input.familyId),
        columns: {
          id: true,
          name: true,
          mobile: true,
        },
        with: {
          ward: { columns: { id: true, name: true } },
          familyHead: { columns: { id: true } },
        },
        orderBy: asc(parishoners.name),
      });
    }),
});
