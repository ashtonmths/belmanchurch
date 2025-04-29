"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DonateButton from "~/components/DonateButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="min-h-screen w-full bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <ToastContainer />
      <div className="flex min-h-screen w-full items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="mb-10 mt-[35%] w-[90%] max-w-xl rounded-2xl bg-[#C8AE7D] p-6 text-[#65451F] shadow-2xl sm:p-10 md:mt-36">
          <h1 className="mb-6 text-center text-3xl font-extrabold">
            Make a Donation
          </h1>

          <div className="space-y-3">
            {/* Donation Type */}
            <div>
              <label className="mb-1 block font-semibold">Donation Type:</label>
              <select
                className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="" disabled>
                  --- Select Donation Type ---
                </option>
                <option value="CHURCH">St Joseph - Church Donation</option>
                <option value="CHAPEL">St Anthony - Chapel Donation</option>
                <option value="THANKSGIVING">Thanksgiving Mass</option>
              </select>
            </div>

            {/* From */}
            <div>
              <label className="mb-1 block font-semibold">From:</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
                value={byWhom}
                disabled={!!session?.user.name}
                onChange={(e) => setByWhom(e.target.value)}
              />
            </div>

            {/* For */}
            <div>
              <label className="mb-1 block font-semibold">For:</label>
              {type === "THANKSGIVING" ? (
                <select
                  className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
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
                  className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
                  value={forWhom}
                  disabled
                  onChange={(e) => setForWhom(e.target.value)}
                />
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block font-semibold">Email:</label>
              <input
                type="email"
                className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
                value={email}
                disabled={!!session?.user.email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Mass Timing */}
            <div>
              <label className="mb-1 block font-semibold">Mass Timing:</label>
              {type === "THANKSGIVING" ? (
                <select
                  className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
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
                  className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none"
                  value={massTiming}
                  disabled
                />
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block font-semibold">Amount:</label>
              <input
                type="number"
                min={type === "THANKSGIVING" ? 300 : 100}
                className="w-full rounded-lg border border-[#765827] bg-[#EAC696] p-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#765827]"
                value={amount}
                disabled={type === "THANKSGIVING"}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Donate Button */}
            <div className="min-h-[0px]">
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
      </div>
    </div>
  );
}
