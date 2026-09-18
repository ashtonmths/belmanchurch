"use client";
import dayjs from "dayjs";
import { CheckCircle2, ReceiptText, Search, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ThemedToast from "~/components/ThemedToast";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

export default function DonationAdmin() {
  const [tab, setTab] = useState<"inbox" | "history">("inbox");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const { data: inbox = [], refetch: reloadInbox } =
    api.donation.getInbox.useQuery();
  const { data: history = [], refetch: reloadHistory } =
    api.donation.getHistory.useQuery();
  const issue = api.donation.issueReceipt.useMutation();
  const records = (tab === "inbox" ? inbox : history).filter((item) =>
    `${item.byWhom} ${item.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const upload = async (id: string, email: string, file?: File) => {
    if (!file) return;
    setSending(id);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error());
        reader.onerror = () => reject(new Error());
        reader.readAsDataURL(file);
      });
      await issue.mutateAsync({
        id,
        email,
        method: "upload",
        file: {
          name: `receipt_${id}.${file.name.split(".").pop() ?? "pdf"}`,
          buffer: data,
        },
      });
      await Promise.all([reloadInbox(), reloadHistory()]);
      toast.success("Receipt sent");
    } catch {
      toast.error("Receipt could not be sent");
    } finally {
      setSending(null);
    }
  };
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Donations"
        description="Review completed offerings and send receipts without leaving the queue."
      >
        <ThemedToast />
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/90">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("inbox")}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === "inbox" ? "bg-[#f0c878] text-[#211811]" : "border border-white/15 text-white/60"}`}
              >
                Needs receipt{" "}
                <span className="ml-1 opacity-60">{inbox.length}</span>
              </button>
              <button
                onClick={() => setTab("history")}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === "history" ? "bg-[#f0c878] text-[#211811]" : "border border-white/15 text-white/60"}`}
              >
                Sent
              </button>
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 text-white/50 sm:w-80">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donor or email"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
              />
            </label>
          </div>
          <div className="divide-y divide-white/10">
            {records.map((item) => (
              <article
                key={item.id}
                className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <ReceiptText size={17} className="text-[#f0c878]" />
                    <h2 className="font-semibold">{item.byWhom}</h2>
                  </div>
                  <p className="mt-2 text-sm text-white/45">
                    {item.email} · {dayjs(item.createdAt).format("D MMM YYYY")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/40">Purpose</p>
                    <p className="mt-1 text-white/80">{item.type}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Amount</p>
                    <p className="mt-1 font-semibold text-[#f0c878]">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {item.massTiming && (
                    <div className="col-span-2">
                      <p className="text-white/40">Mass</p>
                      <p className="mt-1 text-white/80">{item.massTiming}</p>
                    </div>
                  )}
                </div>
                {tab === "inbox" ? (
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#f0c878]/50 px-5 text-sm font-semibold text-[#f0c878] hover:bg-[#f0c878] hover:text-[#211811]">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="sr-only"
                      disabled={sending === item.id}
                      onChange={(e) =>
                        void upload(item.id, item.email, e.target.files?.[0])
                      }
                    />
                    <Upload size={16} />
                    {sending === item.id ? "Sending…" : "Upload receipt"}
                  </label>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-emerald-300">
                    <CheckCircle2 size={18} />
                    Receipt sent
                  </span>
                )}
              </article>
            ))}
            {records.length === 0 && (
              <div className="p-14 text-center">
                <ReceiptText className="mx-auto text-white/20" size={34} />
                <p className="mt-4 text-white/45">
                  {tab === "inbox"
                    ? "No receipts are waiting."
                    : "No sent receipts match this search."}
                </p>
              </div>
            )}
          </div>
        </section>
      </PageShell>
    </ProtectedRoute>
  );
}
