"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ExternalLink,
  FileText,
  GalleryHorizontal,
  HandHeart,
  Images,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Users,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/carousel", label: "Homepage carousel", Icon: GalleryHorizontal },
  { href: "/admin/events", label: "Events", Icon: CalendarDays },
  { href: "/admin/notices", label: "Notifications", Icon: Bell },
  { href: "/admin/gallery", label: "Gallery", Icon: Images, photographer: true },
  { href: "/admin/bethkati", label: "Bethkati", Icon: BookOpen },
  { href: "/admin/priests", label: "Priests", Icon: UserRound },
  { href: "/admin/content", label: "Page content", Icon: FileText },
  { href: "/admin/messages", label: "Messages", Icon: Inbox },
  { href: "/admin/donation", label: "Donations & receipts", Icon: HandHeart },
  { href: "/admin/reports", label: "Donation reports", Icon: BarChart3 },
  { href: "/admin/families", label: "Families", Icon: Users },
];

const ADMIN_ROLES = ["ADMIN", "DEVELOPER"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isLogin = pathname === "/admin/login";
  const role = session?.user?.role;
  const isAdmin = !!role && ADMIN_ROLES.includes(role);
  const isPhotographer = role === "PHOTOGRAPHER";
  const allowed = isAdmin || (isPhotographer && pathname.startsWith("/admin/gallery"));

  useEffect(() => {
    if (isLogin || status === "loading") return;
    if (status === "unauthenticated") router.replace("/admin/login");
    else if (!allowed) router.replace(isPhotographer ? "/admin/gallery" : "/unauthorized");
  }, [isLogin, status, allowed, isPhotographer, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (isLogin) {
    return (
      <>
        {children}
        <ToastContainer position="bottom-right" />
      </>
    );
  }

  if (status !== "authenticated" || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-accent">
        <Loader2 className="animate-spin" size={32} aria-label="Loading" />
      </div>
    );
  }

  const links = NAV.filter((item) => isAdmin || item.photographer);
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col gap-1 p-4">
      <Link href="/admin" className="mb-6 flex items-center gap-3 px-2">
        <Image src="/Logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
        <span className="leading-tight">
          <span className="block font-serif text-lg font-semibold text-cream">St. Joseph Church</span>
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary">
            Admin
          </span>
        </span>
      </Link>
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive(href) ? "bg-primary text-ink" : "text-cream/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon size={18} aria-hidden /> {label}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/75 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink size={18} aria-hidden /> View website
        </Link>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} aria-hidden /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-xs text-cream/40">{session.user.email}</p>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-ink lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 bg-ink">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 p-2 text-cream"
            >
              <X size={22} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-accent/10 bg-white px-4 py-3 lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="p-1 text-ink">
            <Menu size={24} />
          </button>
          <span className="font-serif text-lg font-semibold text-ink">Admin</span>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
