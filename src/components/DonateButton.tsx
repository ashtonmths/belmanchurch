/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import Script from "next/script";
import { api } from "~/trpc/react";
import { toast } from "react-toastify";

interface DonateButtonProps {
  type: "CHURCH" | "CHAPEL" | "THANKSGIVING";
  amount: string;
  forWhom: string;
  byWhom: string;
  email: string;
  purpose?: string;
  massTiming?: string;
  onValidate: () => boolean;
}

export default function DonateButton({
  type,
  amount,
  forWhom,
  byWhom,
  email,
  purpose,
  massTiming,
  onValidate,
}: DonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const createOrder = api.donation.createOrder.useMutation();
  const verifyPayment = api.donation.verifyPayment.useMutation();

  const handlePayment = async () => {
    const isValid = onValidate();
    if (!isValid) return;

    setLoading(true);
    try {
      const { razorpayOrderId } = await createOrder.mutateAsync({
        type,
        amount: Number(amount),
        forWhom,
        byWhom,
        email,
        purpose,
        massTiming,
      });

      const paymentObject = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(amount) * 100,
        currency: "INR",
        name: "Belman Church",
        description: `Donation type: ${type}`,
        order_id: razorpayOrderId,
        prefill: {
          name: byWhom,
          email,
          contact: "9999999999",
        },
        theme: { color: "#EAC696" },
        handler: async (response: any) => {
          if (response.razorpay_payment_id) {
            await verifyPayment.mutateAsync({
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(
              `Payment Successful! Payment ID: ${response.razorpay_payment_id}`
            );
          }
        },
      });

      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        className="w-full rounded-lg bg-accent p-3 text-primary font-semibold disabled:opacity-50"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Donate"}
      </button>
    </>
  );
}
