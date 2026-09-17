"use client";
import dayjs from "dayjs";
import {
  ArrowUpRight,
  CalendarClock,
  IndianRupee,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { api } from "~/trpc/react";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export default function AdminDashboard() {
  const { data: donations = [], isLoading } = api.donation.getAll.useQuery();
  const total = donations.reduce((sum, item) => sum + item.amount, 0);
  const thisMonth = donations
    .filter((item) => dayjs(item.createdAt).isSame(dayjs(), "month"))
    .reduce((sum, item) => sum + item.amount, 0);
  const chart = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => dayjs().subtract(5 - i, "month")).map(
        (month) => ({
          month: month.format("MMM"),
          amount: donations
            .filter((item) => dayjs(item.createdAt).isSame(month, "month"))
            .reduce((sum, item) => sum + item.amount, 0),
        }),
      ),
    [donations],
  );
  const stats = [
    { label: "Total received", value: money.format(total), icon: IndianRupee },
    {
      label: "This month",
      value: money.format(thisMonth),
      icon: CalendarClock,
    },
    {
      label: "Donation records",
      value: String(donations.length),
      icon: ReceiptText,
    },
  ];
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Overview"
        description="A clear view of parish giving and recent activity."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <section
              key={label}
              className="rounded-2xl border border-white/10 bg-[#211811]/90 p-5 sm:p-6"
            >
              <Icon size={20} className="text-[#f0c878]" />
              <p className="mt-5 text-sm text-white/50">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                {isLoading ? "—" : value}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-[#211811]/90 p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Giving over six months</h2>
              <p className="mt-1 text-sm text-white/45">
                Completed donations, grouped by month.
              </p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    stroke="#ffffff66"
                  />
                  <Tooltip
                    cursor={{ fill: "#ffffff08" }}
                    contentStyle={{
                      background: "#17110c",
                      border: "1px solid #ffffff1a",
                      borderRadius: 12,
                    }}
                    formatter={(value: number) => money.format(value)}
                  />
                  <Bar dataKey="amount" fill="#f0c878" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="rounded-3xl border border-white/10 bg-[#211811]/90 p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent donations</h2>
                <p className="mt-1 text-sm text-white/45">
                  Latest completed records.
                </p>
              </div>
              <Link
                href="/admin/donation"
                className="text-[#f0c878]"
                aria-label="View donations"
              >
                <ArrowUpRight />
              </Link>
            </div>
            <div className="mt-5 divide-y divide-white/10">
              {donations.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.byWhom}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {dayjs(item.createdAt).format("D MMM YYYY")}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-[#f0c878]">
                    {money.format(item.amount)}
                  </p>
                </div>
              ))}
              {!isLoading && donations.length === 0 && (
                <p className="py-10 text-center text-sm text-white/40">
                  No donations recorded yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
