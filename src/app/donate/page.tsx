"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import DonateButton from "~/components/DonateButton";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import "react-toastify/dist/ReactToastify.css";

type DonationType = "CHURCH" | "CHAPEL" | "THANKSGIVING";
const purposes: Array<{ value: DonationType; label: string; detail: string }> =
  [
    {
      value: "CHURCH",
      label: "St. Joseph Church",
      detail: "Support the parish and its work",
    },
    {
      value: "CHAPEL",
      label: "St. Anthony Chapel",
      detail: "Support the chapel at Pakala",
    },
    {
      value: "THANKSGIVING",
      label: "Thanksgiving Mass",
      detail: "Offer a Mass for an occasion",
    },
  ];

function nextDate(weekday: number) {
  const today = dayjs();
  return today.add((7 + weekday - today.day()) % 7 || 7, "day");
}

export default function DonatePage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<DonationType | null>(null);
  const [forWhom, setForWhom] = useState("");
  const [byWhom, setByWhom] = useState(session?.user.name ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [amount, setAmount] = useState("");
  const [massTiming, setMassTiming] = useState("");

  const choosePurpose = (value: DonationType) => {
    setType(value);
    if (value === "CHURCH") {
      setForWhom("St Joseph Church, Belman");
      setAmount("");
      setMassTiming("Not applicable");
    }
    if (value === "CHAPEL") {
      setForWhom("St Anthony Chapel, Manjarpalke");
      setAmount("");
      setMassTiming("Not applicable");
    }
    if (value === "THANKSGIVING") {
      setForWhom("");
      setAmount("300");
      setMassTiming("");
    }
  };

  const detailsValid = () => {
    if (!byWhom.trim() || !email.trim()) {
      toast.error("Enter your name and email address");
      return false;
    }
    if (!type || Number(amount) < (type === "THANKSGIVING" ? 300 : 100)) {
      toast.error("Enter the minimum donation amount");
      return false;
    }
    if (type === "THANKSGIVING" && (!forWhom || !massTiming)) {
      toast.error("Choose an occasion and Mass timing");
      return false;
    }
    return true;
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878] disabled:text-white/45";
  const purpose = purposes.find((item) => item.value === type);

  return (
    <ProtectedRoute allowedRoles={["DEVELOPER", "ADMIN"]}>
      <PageShell
        title="Make a donation"
        description="A secure, simple way to support the parish."
        contentClassName="mx-auto w-full max-w-5xl"
      >
        <ToastContainer />
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/95 shadow-2xl">
          <div className="flex border-b border-white/10 px-5 py-5 sm:px-8">
            {["Purpose", "Details", "Review"].map((label, index) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs ${step > index + 1 ? "bg-[#f0c878] text-[#211811]" : step === index + 1 ? "border border-[#f0c878] text-[#f0c878]" : "border border-white/15 text-white/35"}`}
                >
                  {step > index + 1 ? <Check size={14} /> : index + 1}
                </span>
                <span
                  className={`hidden text-sm sm:block ${step === index + 1 ? "text-white" : "text-white/40"}`}
                >
                  {label}
                </span>
                {index < 2 && <span className="mx-2 h-px flex-1 bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="min-h-[28rem] p-5 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.section
                  key="purpose"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-semibold">
                    Where should your offering go?
                  </h2>
                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    {purposes.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        onClick={() => choosePurpose(item.value)}
                        className={`min-h-40 rounded-2xl border p-6 text-left transition ${type === item.value ? "border-[#f0c878] bg-[#f0c878]/10" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}
                      >
                        <h3 className="font-medium text-white">
                          Donation for {item.label}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-white/50">
                          {item.detail}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      disabled={!type}
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 rounded-full bg-[#f0c878] px-6 py-3 font-medium text-[#211811] disabled:opacity-35"
                    >
                      Continue
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </motion.section>
              )}

              {step === 2 && (
                <motion.section
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-semibold">Donation details</h2>
                  <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <Field label="Your name">
                      <input
                        className={inputClass}
                        value={byWhom}
                        disabled={!!session?.user.name}
                        onChange={(event) => setByWhom(event.target.value)}
                      />
                    </Field>
                    <Field label="Email address">
                      <input
                        type="email"
                        className={inputClass}
                        value={email}
                        disabled={!!session?.user.email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </Field>
                    {type === "THANKSGIVING" ? (
                      <>
                        <Field label="Occasion">
                          <select
                            className={inputClass}
                            value={forWhom}
                            onChange={(event) => setForWhom(event.target.value)}
                          >
                            <option value="">Select an occasion</option>
                            {[
                              "Birthday",
                              "Anniversary",
                              "Wedding",
                              "Success",
                              "Healing",
                              "Thanksgiving",
                            ].map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Mass timing">
                          <select
                            className={inputClass}
                            value={massTiming}
                            onChange={(event) =>
                              setMassTiming(event.target.value)
                            }
                          >
                            <option value="">Select Mass timing</option>
                            <option
                              value={nextDate(6)
                                .hour(16)
                                .format("dddd, MMMM D - h:mmA")}
                            >
                              Saturday - 4:00 PM
                            </option>
                            <option
                              value={nextDate(0)
                                .hour(7)
                                .minute(30)
                                .format("dddd, MMMM D - h:mmA")}
                            >
                              Sunday - 7:30 AM
                            </option>
                            <option
                              value={nextDate(0)
                                .hour(10)
                                .minute(30)
                                .format("dddd, MMMM D - h:mmA")}
                            >
                              Sunday - 10:30 AM
                            </option>
                          </select>
                        </Field>
                      </>
                    ) : (
                      <Field label="Offering for">
                        <input
                          className={inputClass}
                          value={forWhom}
                          disabled
                        />
                      </Field>
                    )}
                    <Field label="Amount (₹)">
                      <input
                        type="number"
                        min={type === "THANKSGIVING" ? 300 : 100}
                        className={inputClass}
                        value={amount}
                        disabled={type === "THANKSGIVING"}
                        onChange={(event) => setAmount(event.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Back onClick={() => setStep(1)} />
                    <button
                      type="button"
                      onClick={() => detailsValid() && setStep(3)}
                      className="flex items-center gap-2 rounded-full bg-[#f0c878] px-6 py-3 font-medium text-[#211811]"
                    >
                      Review
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </motion.section>
              )}

              {step === 3 && type && (
                <motion.section
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-semibold">
                    Review your donation
                  </h2>
                  <dl className="mt-7 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] px-5">
                    <Summary label="Purpose" value={purpose?.label ?? type} />
                    <Summary label="From" value={byWhom} />
                    <Summary label="Email" value={email} />
                    <Summary label="For" value={forWhom} />
                    {type === "THANKSGIVING" && (
                      <Summary label="Mass" value={massTiming} />
                    )}
                    <Summary label="Amount" value={`₹${amount}`} />
                  </dl>
                  <p className="mt-5 text-sm leading-6 text-white/45">
                    You will be redirected to Razorpay to complete the payment
                    securely.
                  </p>
                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Back onClick={() => setStep(2)} />
                    <div className="w-full sm:w-auto">
                      <DonateButton
                        type={type}
                        amount={amount}
                        forWhom={forWhom}
                        byWhom={byWhom}
                        email={email}
                        massTiming={massTiming}
                        onValidate={detailsValid}
                      />
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/60">{label}</span>
      {children}
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
      <dt className="text-sm text-white/45">{label}</dt>
      <dd className="font-medium text-white sm:text-right">{value}</dd>
    </div>
  );
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-white/70"
    >
      <ArrowLeft size={17} />
      Back
    </button>
  );
}
