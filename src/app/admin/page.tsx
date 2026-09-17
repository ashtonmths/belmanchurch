"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "~/trpc/react";
import { useMemo } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ProtectedRoute from "~/components/ProtectRoute";
import PageShell from "~/components/PageShell";

dayjs.extend(isBetween);

export default function AdminDashboard() {
  const { data: donations } = api.donation.getAll.useQuery();

  const totalDonations = useMemo(() => {
    return donations?.reduce((sum, donation) => sum + donation.amount, 0) ?? 0;
  }, [donations]);

  const weeklyDonations = useMemo(() => {
    if (!donations || !Array.isArray(donations)) return 0;

    const today = dayjs();
    const dayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday

    // Get the most recent Saturday (start of the week)
    const startOfWeek = today
      .subtract((dayOfWeek + 1) % 7, "day")
      .startOf("day");

    // Get the upcoming Friday (end of the week)
    const endOfWeek = startOfWeek.add(6, "day").endOf("day");
    console.log(
      "Start of Week (Saturday):",
      startOfWeek.format("YYYY-MM-DD HH:mm:ss"),
    );
    console.log(
      "End of Week (Friday):",
      endOfWeek.format("YYYY-MM-DD HH:mm:ss"),
    );

    return donations
      .filter((donation) => {
        const donationDate = dayjs(donation.createdAt);
        return donationDate.isBetween(startOfWeek, endOfWeek, "day", "[]"); // Inclusive range
      })
      .reduce((sum, donation) => sum + donation.amount, 0);
  }, [donations]);

  const monthlyData = useMemo(() => {
    if (!donations || !Array.isArray(donations)) return [];

    const currentYear = dayjs().year();

    // Filter donations to only include those from the current year
    const filteredDonations = donations.filter((donation) => {
      return dayjs(donation.createdAt).year() === currentYear;
    });

    // Group by month index (0-11)
    const grouped = filteredDonations.reduce(
      (acc, donation) => {
        const monthIndex = dayjs(donation.createdAt).month(); // Get month index (0 for Jan, 11 for Dec)
        acc[monthIndex] = (acc[monthIndex] ?? 0) + donation.amount;
        return acc;
      },
      {} as Record<number, number>,
    );

    // Convert to array and sort by month index
    return Object.entries(grouped)
      .map(([monthIndex, donations]) => ({
        month: dayjs().month(Number(monthIndex)).format("MMM"), // Convert index to short month name
        monthIndex: Number(monthIndex), // Keep the numeric index for sorting
        donations,
      }))
      .sort((a, b) => a.monthIndex - b.monthIndex); // Sort numerically
  }, [donations]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell admin title="Dashboard">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-md sm:p-6">
          <div className="flex min-h-[65vh] w-full flex-col gap-5 md:flex-row">
            {/* Left Panel */}
            <div className="flex w-full flex-col gap-5 text-white md:w-1/3">
              <div className="flex min-h-36 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl font-bold text-[#f0c878]">
                <p>
                  Total Donations: <br />
                  <br />₹{totalDonations.toLocaleString()}
                </p>
              </div>
              <div className="flex min-h-36 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl font-bold text-[#f0c878]">
                <p>
                  Weekly Donations: <br />
                  <br />₹{weeklyDonations.toLocaleString()}
                </p>
              </div>
              <div className="flex min-h-36 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl font-bold text-[#f0c878]">
                <div>
                  <p className="text-sm font-medium text-white/50">
                    Donation records
                  </p>
                  <p className="mt-3 text-3xl text-[#f0c878]">
                    {donations?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex h-full w-full flex-col text-white md:w-2/3">
              {/* Graph Section */}
              <div className="h-80 rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:p-5 md:h-[60%]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="month" stroke="#EAC696" />
                    <YAxis stroke="#EAC696" />
                    <Tooltip
                      cursor={{ fill: "rgb(0 0 0 / 0.5)" }}
                      contentStyle={{
                        backgroundColor: "#222",
                        borderRadius: "5px",
                        color: "#EAC696",
                      }}
                    />
                    <Bar
                      dataKey="donations"
                      fill="#EAC696"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Empty Div Below Graph */}
              <div className="mt-5 flex min-h-40 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl font-bold text-[#f0c878]">
                <div className="p-6 text-left">
                  <p className="text-lg font-medium text-white">
                    Monthly giving overview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Completed donations from the current calendar year are
                    reflected in the chart above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
