"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DonateButton from "~/components/DonateButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "~/components/ProtectRoute";
import PageShell from "~/components/PageShell";

function getNextWeekdayDate(weekday: number) {
  const today = dayjs();
  const daysUntilNext = (7 + weekday - today.day()) % 7 || 7;
  return today.add(daysUntilNext, "day");
}

export default function DonatePage() {
  const { data: session } = useSession();

  const [selectedType, setSelectedType] = useState<string>("");
  const [forWhom, setForWhom] = useState("");
  const [byWhom, setByWhom] = useState(session?.user.name ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [amount, setAmount] = useState("");
  const [massTiming, setMassTiming] = useState("");

  const type = selectedType as "CHURCH" | "CHAPEL" | "THANKSGIVING" | undefined;

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (value === "CHURCH") {
      setForWhom("St Joseph Church, Belman");
      setAmount("");
    } else if (value === "CHAPEL") {
      setForWhom("St Anthony Church, Manjarpalke");
      setAmount("");
    } else if (value === "THANKSGIVING") {
      setForWhom("");
      setAmount("300");
    }
  };

  useEffect(() => {
    if (type === "CHURCH" || type === "CHAPEL") {
      const nextSat = getNextWeekdayDate(6).hour(16).minute(0);
      const nextSun730 = getNextWeekdayDate(0).hour(7).minute(30);
      const nextSun1030 = getNextWeekdayDate(0).hour(10).minute(30);
      const allMasses = [nextSat, nextSun730, nextSun1030];
      const nextMass = allMasses.find((mass) => mass.isAfter(dayjs()))!;
      setMassTiming(nextMass.format("dddd, MMMM D - h:mmA"));
    }
  }, [type]);

  const validateForm = () => {
    if (!type) {
      toast.error("Please select a donation type.");
      return false;
    }
    if (!byWhom.trim()) {
      toast.error("Please enter your name.");
      return false;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return false;
    }
    if (!massTiming.trim()) {
      toast.error("Please select a mass timing.");
      return false;
    }
    if (Number(amount) < (type === "THANKSGIVING" ? 300 : 100)) {
      toast.error("Amount is below the minimum required.");
      return false;
    }
    return true;
  };

  return (
    <ProtectedRoute allowedRoles={["DEVELOPER", "ADMIN"]}>
      <PageShell
        title="Make a donation"
        description="Choose where your offering should go and complete the details below."
        contentClassName="mx-auto max-w-3xl"
      >
        <ToastContainer />
        <div className="rounded-3xl border border-white/10 bg-[#211811]/90 p-5 text-white shadow-2xl backdrop-blur-md sm:p-8">
          <fieldset>
            <legend className="mb-4 text-sm font-medium text-white/65">
              Choose a purpose
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["CHURCH", "St. Joseph Church"],
                  ["CHAPEL", "St. Anthony Chapel"],
                  ["THANKSGIVING", "Thanksgiving Mass"],
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleTypeChange(value)}
                  className={`min-h-20 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${selectedType === value ? "border-[#f0c878] bg-[#f0c878] text-[#211811]" : "border-white/15 bg-white/[0.04] text-white/75 hover:border-white/30"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {/* From */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/65">
                Your name
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878] disabled:text-white/50"
                value={byWhom}
                disabled={!!session?.user.name}
                onChange={(e) => setByWhom(e.target.value)}
              />
            </div>

            {/* For */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/65">
                Offering for
              </label>
              {type === "THANKSGIVING" ? (
                <select
                  className="w-full rounded-xl border border-white/15 bg-[#211811] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
                  value={forWhom}
                  onChange={(e) => setForWhom(e.target.value)}
                >
                  <option value="">----- Select Occasion -----</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Success">Success</option>
                  <option value="Healing">Healing</option>
                  <option value="Thanksgiving">General Thanksgiving</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none disabled:text-white/50"
                  value={forWhom}
                  disabled
                  onChange={(e) => setForWhom(e.target.value)}
                />
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/65">
                Email address
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878] disabled:text-white/50"
                value={email}
                disabled={!!session?.user.email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Mass Timing */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/65">
                Mass timing
              </label>
              {type === "THANKSGIVING" ? (
                <select
                  className="w-full rounded-xl border border-white/15 bg-[#211811] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
                  value={massTiming}
                  onChange={(e) => setMassTiming(e.target.value)}
                >
                  <option value="">-- Select Mass Timing --</option>
                  <option
                    value={getNextWeekdayDate(6)
                      .hour(16)
                      .minute(0)
                      .format("dddd, MMMM D - h:mmA")}
                  >
                    Saturday - 4:00PM ({getNextWeekdayDate(6).format("MMMM D")})
                  </option>
                  <option
                    value={getNextWeekdayDate(0)
                      .hour(7)
                      .minute(30)
                      .format("dddd, MMMM D - h:mmA")}
                  >
                    Sunday - 7:30AM ({getNextWeekdayDate(0).format("MMMM D")})
                  </option>
                  <option
                    value={getNextWeekdayDate(0)
                      .hour(10)
                      .minute(30)
                      .format("dddd, MMMM D - h:mmA")}
                  >
                    Sunday - 10:30AM ({getNextWeekdayDate(0).format("MMMM D")})
                  </option>
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none disabled:text-white/50"
                  value={massTiming}
                  disabled
                />
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/65">
                Amount (₹)
              </label>
              <input
                type="number"
                min={type === "THANKSGIVING" ? 300 : 100}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878] disabled:text-white/50"
                value={amount}
                disabled={type === "THANKSGIVING"}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Donate Button */}
            <div className="flex items-end sm:justify-end">
              {type && (
                <DonateButton
                  type={type}
                  amount={amount}
                  forWhom={forWhom}
                  byWhom={byWhom}
                  email={email}
                  massTiming={massTiming}
                  onValidate={validateForm}
                />
              )}
            </div>
          </div>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
