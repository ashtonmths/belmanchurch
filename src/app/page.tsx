import { type Metadata } from "next";
import Footer from "~/components/Footer";
import JsonLd from "~/components/JsonLd";
import MassTimings from "~/components/MassTimings";
import HeroCarousel from "~/components/home/HeroCarousel";
import {
  Associations,
  Institutions,
  NoticesSection,
  UpcomingEvents,
} from "~/components/home/HomeFeeds";
import { Explore, QuoteBand, StatsBand, Visit, Welcome } from "~/components/home/HomeSections";
import TodayBand from "~/components/home/TodayBand";
import { MASS_TIMINGS, PARISH, SITE_URL } from "~/lib/parish";
import { parishStructuredData, siteNavigationStructuredData } from "~/lib/structured-data";
import { getContent } from "~/server/content";
import { db } from "~/server/db";

// Content is edited from the admin panel, so render on every request.
export const dynamic = "force-dynamic";

const sundayTimes =
  MASS_TIMINGS.find((entry) => entry.label === "Sunday Mass")?.times.join(" and ") ?? "";

const homeTitle = `${PARISH.name} | Mass Timings & Parish Life`;
const homeDescription = `Mass timings, events and parish news from ${PARISH.name}, ${PARISH.address.locality}. Sunday Mass at ${sundayTimes}. Established ${PARISH.founded}.`;

export const metadata: Metadata = {
  // Absolute: the parish name is already in the title, so the layout's
  // "| Belman Church" suffix would only repeat it.
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: { title: homeTitle, description: homeDescription, url: SITE_URL },
  twitter: { title: homeTitle, description: homeDescription },
};

export default async function Home() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const [
    slides,
    massTimings,
    otherServices,
    officeHours,
    associations,
    institutions,
    heroTint,
    notices,
    events,
    priests,
  ] = await Promise.all([
    db.carouselSlide.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, imageUrl: true, title: true, subtitle: true },
    }),
    getContent("massTimings"),
    getContent("otherServices"),
    getContent("officeHours"),
    getContent("associations"),
    getContent("institutions"),
    getContent("heroTint"),
    db.notification.findMany({
      where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      take: 3,
    }),
    db.event.findMany({
      where: { date: { gte: startOfToday } },
      orderBy: { date: "asc" },
      take: 3,
    }),
    db.priest.findMany({
      where: { isCurrent: true },
      orderBy: [{ role: "asc" }, { order: "asc" }],
      select: { name: true, role: true, imageUrl: true },
    }),
  ]);

  return (
    <>
      <JsonLd data={parishStructuredData({ massTimings, otherServices, officeHours })} />
      <JsonLd
        data={siteNavigationStructuredData([
          { name: "Events", href: "/events" },
          { name: "Gallery", href: "/gallery" },
          { name: "Bethkati", href: "/bethkati" },
          { name: "History", href: "/about" },
          { name: "Contact", href: "/contact" },
        ])}
      />
      <main>
        <HeroCarousel slides={slides} massTimings={massTimings} tint={heroTint} />
        <TodayBand />
        <StatsBand />
        <NoticesSection notices={notices} />
        <Welcome priests={priests} />
        <UpcomingEvents events={events} />
        <Explore />
        <MassTimings massTimings={massTimings} otherServices={otherServices} />
        <Associations items={associations} />
        <QuoteBand />
        <Institutions items={institutions} />
        <Visit officeHours={officeHours} otherServices={otherServices} />
      </main>
      <Footer />
    </>
  );
}
