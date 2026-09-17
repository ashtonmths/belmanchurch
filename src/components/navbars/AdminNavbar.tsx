"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "~/hooks/useRole";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/donation", label: "Donations" },
  { href: "/admin/families", label: "Families" },
  { href: "/admin/misc", label: "Events & Bethkati" },
  { href: "/admin/gallery", label: "Gallery" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const role = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const links =
    role === "PHOTOGRAPHER"
      ? adminLinks.filter((link) => link.href === "/admin/gallery")
      : adminLinks;

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-5">
      <nav
        aria-label="Administration navigation"
        className="pointer-events-auto mx-auto flex h-[4.75rem] max-w-7xl items-center rounded-2xl border border-white/10 bg-[#241a12]/90 px-3 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:px-4"
      >
        <Link
          href={role === "PHOTOGRAPHER" ? "/admin/gallery" : "/admin"}
          className="group flex min-w-0 items-center gap-2.5 rounded-xl pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Belman Church administration"
        >
          <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
            <Image
              alt="St. Joseph Church crest"
              src="/Logo.png"
              height={50}
              width={50}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary/70 sm:text-xs">
              <ShieldCheck aria-hidden="true" size={13} />
              Administration
            </span>
            <span className="block text-lg font-bold tracking-tight text-[#fffaf1] sm:text-xl">
              Belman Parish
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive(link.href)
                  ? "bg-primary text-textcolor"
                  : "text-[#fffaf1]/70 hover:bg-white/10 hover:text-[#fffaf1]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3.5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-textcolor focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            View site
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open administration menu"
          aria-expanded={isOpen}
          aria-controls="admin-mobile-navigation"
        >
          <Menu aria-hidden="true" size={24} />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="admin-mobile-navigation"
            className="pointer-events-auto fixed inset-0 z-50 bg-black/60 p-3 backdrop-blur-md sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="ml-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#241a12] p-5 shadow-2xl"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15">
                    <ShieldCheck className="text-primary" size={24} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/65">
                      Administration
                    </p>
                    <p className="text-xl font-bold text-[#fffaf1]">
                      {role ?? "Staff"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-[#fffaf1] transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close administration menu"
                >
                  <X aria-hidden="true" size={23} />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-2 py-6">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-semibold transition ${
                        isActive(link.href)
                          ? "bg-primary text-textcolor"
                          : "text-[#fffaf1]/80 hover:bg-white/10 hover:text-[#fffaf1]"
                      }`}
                    >
                      {link.label}
                      <span aria-hidden="true" className="text-sm opacity-40">
                        0{index + 1}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 px-5 py-4 text-base font-bold text-primary"
              >
                <ArrowLeft aria-hidden="true" size={18} />
                Return to website
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
