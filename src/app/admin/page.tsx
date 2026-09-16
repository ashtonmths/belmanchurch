"use client";

import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GalleryHorizontal,
  Images,
  Inbox,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const unread = api.contact.unreadCount.useQuery();
  const events = api.event.list.useQuery();
  const notices = api.notice.listActive.useQuery();
  const slides = api.carousel.adminList.useQuery();
  const current = api.priest.current.useQuery();

  const stats = [
    { label: "Unread messages", value: unread.data, href: "/admin/messages", Icon: Inbox, highlight: (unread.data ?? 0) > 0 },
    { label: "Upcoming events", value: events.data?.upcoming.length, href: "/admin/events", Icon: CalendarDays },
    { label: "Live notifications", value: notices.data?.length, href: "/admin/notices", Icon: Bell },
    { label: "Carousel slides", value: slides.data?.length, href: "/admin/carousel", Icon: GalleryHorizontal },
  ];

  const shortcuts = [
    { href: "/admin/events", title: "Add an event", body: "Details, date, venue and photos.", Icon: CalendarDays },
    { href: "/admin/notices", title: "Post a notification", body: "Announcements shown on the homepage.", Icon: Bell },
    { href: "/admin/gallery", title: "Upload to the gallery", body: "Photo albums from parish life.", Icon: Images },
    { href: "/admin/bethkati", title: "Publish Bethkati", body: "Upload this month's newsletter PDF.", Icon: BookOpen },
    { href: "/admin/priests", title: "Update priests", body: "Names, photos and who is serving now.", Icon: UserRound },
    { href: "/admin/content", title: "Edit page content", body: "Mass timings, associations and more.", Icon: FileText },
  ];

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold text-ink">
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mt-2 text-textcolor/80">Manage everything on the parish website from here.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, href, Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
              highlight ? "border-accent bg-primary/30" : "border-accent/10 bg-white"
            }`}
          >
            <Icon size={20} className="text-accent" aria-hidden />
            <p className="mt-3 font-serif text-4xl font-semibold text-ink">{value ?? "…"}</p>
            <p className="mt-1 text-sm text-textcolor/70">{label}</p>
          </Link>
        ))}
      </div>

      {current.data && current.data.length > 0 && (
        <p className="mt-6 text-sm text-textcolor/80">
          Currently serving:{" "}
          {current.data.map((p) => `${p.name} (${p.role === "PARISH_PRIEST" ? "Parish Priest" : "Assistant"})`).join(" · ")}
        </p>
      )}

      <h2 className="mt-10 font-serif text-2xl font-semibold text-ink">Quick actions</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map(({ href, title, body, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-accent/10 bg-white p-5 transition hover:border-primary hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/35 text-accent">
              <Icon size={20} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold text-ink">
                {title}
                <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden />
              </span>
              <span className="mt-0.5 block text-sm text-textcolor/70">{body}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
