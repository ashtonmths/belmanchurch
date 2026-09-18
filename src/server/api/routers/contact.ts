import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { contactInquiries } from "~/server/db/schema";
import { sendContactNotification } from "~/server/utils/mail";

const contactSubject = z.enum([
  "General enquiry",
  "Parish certificate",
  "Sacrament or service",
  "Website or gallery",
]);

export const contactRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(254),
        phone: z.string().trim().max(20).optional(),
        subject: contactSubject,
        message: z.string().trim().min(10).max(2000),
        website: z.string().max(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inquiry] = await ctx.db
        .insert(contactInquiries)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone?.length ? input.phone : null,
          subject: input.subject,
          message: input.message,
        })
        .returning();
      if (!inquiry) throw new Error("Unable to save contact enquiry");
      const emailSent = await sendContactNotification(inquiry);
      return { success: true, emailSent };
    }),
  getAll: adminProcedure.query(({ ctx }) =>
    ctx.db.query.contactInquiries.findMany({
      orderBy: desc(contactInquiries.createdAt),
    }),
  ),
  setRead: adminProcedure
    .input(z.object({ id: z.string(), isRead: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(contactInquiries)
        .set({ isRead: input.isRead, updatedAt: new Date() })
        .where(eq(contactInquiries.id, input.id));
      return { success: true };
    }),
});
