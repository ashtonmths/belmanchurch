import { asc } from "drizzle-orm";
import Link from "next/link";
import DonateClient from "./DonateClient";
import PageShell from "~/components/PageShell";
import { db } from "~/server/db";
import { massSchedules, siteSettings } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export default async function DonatePage() {
  const [settings, schedule] = await Promise.all([
    db.select().from(siteSettings),
    db.query.massSchedules.findMany({
      orderBy: [asc(massSchedules.dayOfWeek), asc(massSchedules.sortOrder)],
    }),
  ]);
  const donationsEnabled =
    settings.find((item) => item.key === "DONATIONS_ENABLED")?.enabled ?? true;
  const catechismEnabled =
    settings.find((item) => item.key === "CATECHISM_ENABLED")?.enabled ?? true;

  if (!donationsEnabled) {
    return (
      <PageShell
        title="Online donations are paused"
        description="The parish has temporarily disabled online donations."
        contentClassName="w-full"
      >
        <section className="flex min-h-[55vh] w-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#211811]/95 p-7 text-center shadow-2xl sm:p-12">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Donations are unavailable for now
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-white/55">
            Please check again later, or contact the parish office if you need
            help with an offering.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full border border-[#f0c878] px-6 font-semibold text-[#f0c878] transition hover:bg-[#f0c878] hover:text-[#211811]"
          >
            Contact the parish office
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <DonateClient massSchedule={schedule} catechismEnabled={catechismEnabled} />
  );
}
