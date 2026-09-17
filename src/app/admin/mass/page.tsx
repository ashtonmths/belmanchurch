"use client";
import { Clock3, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
type Row = {
  id: string;
  label: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  active: boolean;
  sortOrder: number;
};

export default function MassAdminPage() {
  const utils = api.useUtils();
  const { data, isLoading } = api.misc.getMassSchedule.useQuery();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (data) setRows(data);
  }, [data]);
  const update = api.misc.updateMassSchedule.useMutation({
    onSuccess: async () => {
      await utils.misc.getMassSchedule.invalidate();
      toast.success("Mass times updated");
    },
    onError: (error) => toast.error(error.message),
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
        description="These times appear on the homepage and drive the next Mass countdown."
      >
        <ToastContainer />
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/90 shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f0c878]/10 text-[#f0c878]">
                <Clock3 size={21} />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Weekly schedule</h2>
                <p className="text-sm text-white/50">
                  Use local parish time (IST).
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={update.isPending || isLoading}
              onClick={() => update.mutate(rows)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-50"
            >
              <Save size={17} />
              {update.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
          <div className="divide-y divide-white/10">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid gap-4 p-5 sm:grid-cols-[9rem_1fr_9rem_auto] sm:items-end sm:px-7"
              >
                <label className="text-sm text-white/55">
                  Day
                  <select
                    value={row.dayOfWeek}
                    onChange={(e) =>
                      edit(row.id, { dayOfWeek: Number(e.target.value) })
                    }
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white"
                  >
                    {days.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-white/55">
                  Description
                  <input
                    value={row.label}
                    onChange={(e) => edit(row.id, { label: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white"
                  />
                </label>
                <label className="text-sm text-white/55">
                  Time
                  <input
                    type="time"
                    value={`${String(row.hour).padStart(2, "0")}:${String(row.minute).padStart(2, "0")}`}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value
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
                    onChange={(e) => edit(row.id, { active: e.target.checked })}
                    className="h-4 w-4 accent-[#f0c878]"
                  />
                  Visible
                </label>
              </div>
            ))}
          </div>
        </section>
      </PageShell>
    </ProtectedRoute>
  );
}
