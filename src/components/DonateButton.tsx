/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import Script from "next/script";
import { api } from "~/trpc/react";

interface DonateButtonProps {
  type: string;
  amount: string;
  forWhom: string;
  byWhom: string;
  email: string;
}

export default function DonateButton({
  type,
  amount,
  forWhom,
  byWhom,
  email,
}: DonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const createOrder = api.donation.createOrder.useMutation();
  const verifyPayment = api.donation.verifyPayment.useMutation();

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const { razorpayOrderId } = await createOrder.mutateAsync({
        type,
        amount: Number(amount),
        forWhom,
        byWhom,
        email,
      });

      console.log("Razorpay Order ID:", razorpayOrderId);

      const paymentObject = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(amount) * 100,
        currency: "INR",
        name: "Belman Church",
        description: `Donation type: ${type}`,
        order_id: razorpayOrderId,
        prefill: {
          name: byWhom,
          email: "test@example.com",
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

            alert(
              "Payment Successful! Payment ID: " + response.razorpay_payment_id,
            );
          }
        },
      });

      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        className="hover:bg-something w-full rounded-lg bg-accent p-3 text-white disabled:opacity-50"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Donate"}
      </button>
    </>
  );
}
