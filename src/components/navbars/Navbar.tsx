"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/bethkati", label: "Bethkati" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-5">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto mx-auto flex h-[4.75rem] max-w-7xl items-center rounded-2xl border border-white/35 bg-[#fffaf1]/90 px-3 shadow-[0_18px_50px_rgba(42,27,12,0.2)] backdrop-blur-xl sm:px-4"
      >
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 rounded-xl pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="St. Joseph Church Belman, home"
        >
          <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/80 to-secondary/70 shadow-inner">
            <Image
              alt="St. Joseph Church crest"
              src="/Logo.png"
              height={52}
              width={52}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent/70 sm:text-xs">
              St. Joseph Church
            </span>
            <span className="block text-lg font-bold tracking-tight text-textcolor sm:text-xl">
              Belman
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive(link.href)
                  ? "bg-accent text-white shadow-sm"
                  : "text-textcolor/75 hover:bg-primary/45 hover:text-textcolor"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/donate"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-textcolor px-4 py-2.5 text-sm font-bold text-[#fffaf1] shadow-sm transition hover:-translate-y-0.5 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Donate
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-accent/15 bg-primary/45 text-textcolor transition hover:bg-primary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <Menu aria-hidden="true" size={24} />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            className="pointer-events-auto fixed inset-0 z-50 bg-[#2f2418]/55 p-3 backdrop-blur-md sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="ml-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/35 bg-[#fffaf1] p-5 shadow-2xl"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-accent/15 pb-5">
                <div className="flex items-center gap-3">
                  <Image alt="" src="/Logo.png" height={48} width={48} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/70">
                      St. Joseph Church
                    </p>
                    <p className="text-xl font-bold text-textcolor">Belman</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-primary/50 text-textcolor transition hover:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close navigation menu"
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
                          ? "bg-accent text-white"
                          : "text-textcolor hover:bg-primary/45"
                      }`}
                    >
                      {link.label}
                      <span aria-hidden="true" className="text-sm opacity-50">
                        0{index + 1}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/donate"
                className="flex items-center justify-center gap-2 rounded-2xl bg-textcolor px-5 py-4 text-base font-bold text-[#fffaf1] shadow-lg"
              >
                Support the parish
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
