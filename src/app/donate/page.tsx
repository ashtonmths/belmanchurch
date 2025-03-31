"use client";
import { useState } from "react";
import DonateButton from "~/components/DonateButton";

export default function DonatePage() {
  const [type, setType] = useState("");
  const [forWhom, setForWhom] = useState("");
  const [byWhom, setByWhom] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center">
          <div className="text-text flex flex-col items-center bg-secondary p-6">
            <h1 className="text-3xl font-bold mb-4">Donate Page</h1>
            <div className="w-full max-w-md space-y-4 rounded-lg bg-primary p-6 shadow-lg">
              <select
                className="w-full rounded-lg p-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="church">Church Donation</option>
                <option value="charity">Charity</option>
                <option value="mass">Mass</option>
              </select>
              <input
                type="text"
                className="w-full rounded-lg p-2"
                placeholder="For Whom?"
                value={forWhom}
                onChange={(e) => setForWhom(e.target.value)}
              />
              <input
                type="text"
                className="w-full rounded-lg p-2"
                placeholder="By Whom?"
                value={byWhom}
                onChange={(e) => setByWhom(e.target.value)}
              />
              <input
                type="email"
                className="w-full rounded-lg p-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="number"
                className="w-full rounded-lg p-2"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <DonateButton type={type} amount={amount} forWhom={forWhom} byWhom={byWhom} email={email} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
