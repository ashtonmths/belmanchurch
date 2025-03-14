import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import Razorpay from "razorpay";

// ✅ Initialize Razorpay instance with proper env variables
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
  // ✅ CREATE ORDER
  createOrder: publicProcedure
    .input(
      z.object({
        type: z.string(),
        amount: z.number().min(1),
        forWhom: z.string(),
        byWhom: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // ✅ Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
          amount: input.amount * 100, // Convert INR to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });

        if (!razorpayOrder.id) {
          throw new Error("Failed to create Razorpay order");
        }

        // ✅ Store order in DB
        await db.order.create({
          data: {
            razorpayOrderId: razorpayOrder.id, // ✅ Store Razorpay Order ID
            type: input.type,
            amount: input.amount,
            forWhom: input.forWhom,
            byWhom: input.byWhom,
            status: "PENDING",
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

  // ✅ VERIFY PAYMENT
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

        // ✅ Validate Razorpay Signature
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

        // ✅ Update Order in DB
        const updatedOrder = await db.order.update({
          where: { razorpayOrderId: input.razorpay_order_id }, // ✅ FIXED: Using correct field
          data: { status: "SUCCESS", paymentId: input.razorpay_payment_id },
        });

        // ✅ Move order data to Donations Table
        await db.donation.create({
          data: {
            paymentId: input.razorpay_payment_id,
            type: updatedOrder.type,
            amount: updatedOrder.amount,
            forWhom: updatedOrder.forWhom,
            byWhom: updatedOrder.byWhom,
          },
        });

        return { success: true }; // ✅ Indicate success
      } catch (error) {
        console.error("Payment verification failed:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to verify payment",
        });
      }
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db.donation.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          byWhom: true,
          forWhom: true,
          createdAt: true,
        },
      });
    }),
});
