import { db } from "~/server/db";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { sendReceipt } from "~/server/utils/mail";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

type RazorpayVerificationInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export const donationRouter = createTRPCRouter({
  createOrder: publicProcedure
    .input(
      z.object({
        type: z.enum(["CHURCH", "CHAPEL", "THANKSGIVING"]),
        amount: z.number().min(100),
        forWhom: z.string(),
        byWhom: z.string(),
        email: z.string().email(),
        purpose: z.string().optional(),
        massTiming: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: input.amount * 100,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });

        if (!razorpayOrder.id) {
          throw new Error("Failed to create Razorpay order");
        }

        await db.order.create({
          data: {
            razorpayOrderId: razorpayOrder.id,
            type: input.type,
            amount: input.amount,
            forWhom: input.forWhom,
            byWhom: input.byWhom,
            email: input.email,
            status: "PENDING",
            purpose: input.purpose ?? null,
            massTiming: input.massTiming ?? null,
          },
        });

        return { razorpayOrderId: razorpayOrder.id };
      } catch (error) {
        console.error("Order creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }
    }),

  verifyPayment: publicProcedure
    .input(
      z.object({
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
      }),
    )
    .mutation(async ({ input }: { input: RazorpayVerificationInput }) => {
      try {
        const secret = process.env.RAZORPAY_SECRET_KEY;
        if (!secret) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Secret key not set",
          });
        }

        const generatedSignature = crypto
          .createHmac("sha256", secret)
          .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
          .digest("hex");

        if (generatedSignature !== input.razorpay_signature) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid payment signature",
          });
        }

        const updatedOrder = await db.order.update({
          where: { razorpayOrderId: input.razorpay_order_id },
          data: { status: "SUCCESS", paymentId: input.razorpay_payment_id },
        });

        await db.donation.create({
          data: {
            paymentId: input.razorpay_payment_id,
            type: updatedOrder.type,
            amount: updatedOrder.amount,
            forWhom: updatedOrder.forWhom,
            byWhom: updatedOrder.byWhom,
            email: updatedOrder.email,
            purpose: updatedOrder.purpose,
            massTiming: updatedOrder.massTiming,
            receiptIssued: false,
            orderId: updatedOrder.id,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Payment verification failed:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to verify payment",
        });
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!['ADMIN', 'DEVELOPER'].includes(ctx.session.user.role)) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.donation.findMany({
      select: {
        id: true,
        type: true,
        amount: true,
        byWhom: true,
        email: true,
        forWhom: true,
        purpose: true,
        massTiming: true,
        createdAt: true,
        receiptIssued: true,
      },
    });
  }),

  getInbox: protectedProcedure.query(async ({ ctx }) => {
    if (!['ADMIN', 'DEVELOPER'].includes(ctx.session.user.role)) {
      throw new Error("Unauthorized");
    }
    return await db.donation.findMany({
      where: { receiptIssued: false },
      orderBy: { createdAt: "desc" },
    });
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!['ADMIN', 'DEVELOPER'].includes(ctx.session.user.role)) {
      throw new Error("Unauthorized");
    }
    return await db.donation.findMany({
      where: { receiptIssued: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  issueReceipt: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        method: z.enum(["upload", "scan"]),
        email: z.string().email(),
        file: z.object({
          name: z.string(),
          buffer: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!['ADMIN', 'DEVELOPER'].includes(ctx.session.user.role)) {
        throw new Error("Unauthorized");
      }

      const buffer = Buffer.from(input.file.buffer, "base64");

      await sendReceipt(input.email, { name: input.file.name, buffer });

      await db.donation.update({
        where: { id: input.id },
        data: { receiptIssued: true },
      });

      return { success: true };
    }),
});
