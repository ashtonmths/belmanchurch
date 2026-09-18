"use client";
import { Clock3, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

type ScheduleType =
  | "WEEKDAY"
  | "SATURDAY"
  | "SUNDAY_ALWAYS"
  | "SUNDAY_CATECHISM"
  | "SUNDAY_NO_CATECHISM";
const names: Record<ScheduleType, string> = {
  WEEKDAY: "Weekdays",
  SATURDAY: "Saturday",
  SUNDAY_ALWAYS: "Sunday morning",
  SUNDAY_CATECHISM: "Sunday with catechism",
  SUNDAY_NO_CATECHISM: "Sunday without catechism",
};
type Row = {
  id: string;
  label: string;
  dayOfWeek: number;
  scheduleType: ScheduleType;
  hour: number;
  minute: number;
  active: boolean;
  sortOrder: number;
};

export default function MassAdminPage() {
  const utils = api.useUtils();
  const { data, isLoading, isError } = api.misc.getMassSchedule.useQuery();
  const { data: settings } = api.misc.getSiteSettings.useQuery();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (data) setRows(data as Row[]);
  }, [data]);
  const update = api.misc.updateMassSchedule.useMutation({
    onSuccess: async () => {
      await utils.misc.getMassSchedule.invalidate();
      toast.success("Mass times updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateSettings = api.misc.updateSiteSettings.useMutation({
    onSuccess: async () => {
      await utils.misc.getSiteSettings.invalidate();
      toast.success("Catechism setting updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const edit = (id: string, values: Partial<Row>) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...values } : row)),
    );
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Mass times"
        description="Update the weekly schedule and choose which Sunday schedule is currently in use."
      >
        <ToastContainer />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/90 shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f0c878]/10 text-[#f0c878]">
                  <Clock3 size={21} />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">Weekly schedule</h2>
                  <p className="text-sm text-white/50">All times use IST.</p>
                </div>
              </div>
              <button
                disabled={update.isPending || isLoading || !rows.length}
                onClick={() => update.mutate(rows)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-40"
              >
                <Save size={17} />
                {update.isPending ? "Saving…" : "Save times"}
              </button>
            </div>
            {isError ? (
              <p className="p-7 text-red-300">
                The schedule could not be loaded. Refresh this page after the
                database update.
              </p>
            ) : (
              <div className="divide-y divide-white/10">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-4 p-5 sm:grid-cols-[12rem_1fr_9rem_auto] sm:items-end sm:px-7"
                  >
                    <div>
                      <p className="text-sm text-white/45">Schedule</p>
                      <p className="mt-3 font-medium">
                        {names[row.scheduleType]}
                      </p>
                    </div>
                    <label className="text-sm text-white/55">
                      Description
                      <input
                        value={row.label}
                        onChange={(e) =>
                          edit(row.id, { label: e.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white outline-none focus:border-[#f0c878]"
                      />
                    </label>
                    <label className="text-sm text-white/55">
                      Time
                      <input
                        type="time"
                        value={`${String(row.hour).padStart(2, "0")}:${String(row.minute).padStart(2, "0")}`}
                        onChange={(e) => {
                          const [hour = 0, minute = 0] = e.target.value
                            .split(":")
                            .map(Number);
                          edit(row.id, { hour, minute });
                        }}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white"
                      />
                    </label>
                    <label className="flex min-h-12 items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={(e) =>
                          edit(row.id, { active: e.target.checked })
                        }
                        className="h-4 w-4 accent-[#f0c878]"
                      />
                      Shown
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>
          <aside className="h-fit rounded-3xl border border-white/10 bg-[#211811]/90 p-6">
            <h2 className="text-xl font-semibold">Sunday catechism</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              This switches the later Sunday Mass between the catechism and
              non-catechism times.
            </p>
            <div className="mt-6 grid grid-cols-2 rounded-full border border-white/15 p-1">
              <button
                onClick={() =>
                  settings &&
                  updateSettings.mutate({
                    donationEnabled: settings.donationEnabled,
                    catechismEnabled: true,
                  })
                }
                className={`rounded-full px-3 py-2.5 text-sm font-semibold ${settings?.catechismEnabled ? "bg-[#f0c878] text-[#211811]" : "text-white/55"}`}
              >
                Catechism
              </button>
              <button
                onClick={() =>
                  settings &&
                  updateSettings.mutate({
                    donationEnabled: settings.donationEnabled,
                    catechismEnabled: false,
                  })
                }
                className={`rounded-full px-3 py-2.5 text-sm font-semibold ${settings && !settings.catechismEnabled ? "bg-[#f0c878] text-[#211811]" : "text-white/55"}`}
              >
                No catechism
              </button>
            </div>
            <p className="mt-6 rounded-2xl bg-[#f0c878]/10 p-4 text-sm leading-6 text-[#f5d99e]">
              Sunday catechism and non-catechism Mass times may vary from the
              end of March through the end of May. Confirm the current parish
              notice during this period.
            </p>
          </aside>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
