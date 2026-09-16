import { inParishTime } from "~/lib/when";
import { ArrowRight, Bell, Pin } from "lucide-react";
import { type Metadata } from "next";
import Footer from "~/components/Footer";
import PageHero from "~/components/PageHero";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notices",
  description: "Announcements from St. Joseph Church, Belman: Mass changes, meetings and parish news.",
  alternates: { canonical: "/notices" },
};

export default async function NoticesPage() {
  const now = new Date();
  const notices = await db.notification.findMany({
    where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <>
      <PageHero
        eyebrow="Parish announcements"
        title="Notices"
        description="The latest news and announcements from the parish office."
        image="/carousel/nave.jpg"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          {notices.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-accent/25 p-12 text-center text-textcolor/70">
              <Bell className="mx-auto mb-3 text-accent" aria-hidden />
              No notifications for now. Announcements from the parish office will appear here.
            </p>
          ) : (
            <ul className="space-y-5">
              {notices.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-3xl border bg-white p-7 shadow-sm ${n.pinned ? "border-accent" : "border-accent/10"}`}
                >
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent/80">
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/40 px-2 py-0.5 text-accent">
                        <Pin size={12} aria-hidden /> Pinned
                      </span>
                    )}
                    {inParishTime(n.publishedAt).format("D MMMM YYYY")}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">{n.title}</h2>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-textcolor/90">{n.body}</p>
                  {n.link && (
                    <a
                      href={n.link}
                      className="mt-4 inline-flex items-center gap-1 font-semibold text-accent hover:text-ink"
                    >
                      Read more <ArrowRight size={16} aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
