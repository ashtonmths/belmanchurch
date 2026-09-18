"use client";
import { HandCoins, Save, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

export default function SettingsPage() {
  const utils = api.useUtils();
  const { data } = api.misc.getSiteSettings.useQuery();
  const [donations, setDonations] = useState(true);
  useEffect(() => {
    if (data) setDonations(data.donationEnabled);
  }, [data]);
  const update = api.misc.updateSiteSettings.useMutation({
    onSuccess: async () => {
      await utils.misc.getSiteSettings.invalidate();
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Settings"
        description="Control public features without changing the website code."
      >
        <ToastContainer />
        <section className="w-full rounded-3xl border border-white/10 bg-[#211811]/90 p-5 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-6">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f0c878]/10 text-[#f0c878]">
              <Settings2 size={21} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Website features</h2>
              <p className="text-sm text-white/45">
                Changes take effect on the public site immediately.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <HandCoins className="mt-1 shrink-0 text-[#f0c878]" size={20} />
              <div>
                <h3 className="font-semibold">Online donations</h3>
                <p className="mt-1 max-w-md text-sm leading-6 text-white/50">
                  When disabled, donation links disappear and the server stops
                  new payment orders.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={donations}
              onClick={() => setDonations((value) => !value)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${donations ? "bg-[#f0c878]" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${donations ? "left-7" : "left-1"}`}
              />
              <span className="sr-only">Toggle online donations</span>
            </button>
          </div>
          <button
            type="button"
            disabled={!data || update.isPending}
            onClick={() =>
              data &&
              update.mutate({
                donationEnabled: donations,
                catechismEnabled: data.catechismEnabled,
              })
            }
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-40 sm:w-auto"
          >
            <Save size={17} />
            {update.isPending ? "Saving…" : "Save settings"}
          </button>
        </section>
      </PageShell>
    </ProtectedRoute>
  );
}
