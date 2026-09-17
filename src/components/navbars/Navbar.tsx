"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, HandHeart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PARISH } from "~/lib/parish";

const MAIN = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/bethkati", label: "Bethkati" },
];

const MORE = [
  { href: "/shrine", label: "St. Anthony's Shrine" },
  { href: "/associations", label: "Associations" },
  { href: "/commissions", label: "Commissions" },
  { href: "/institutions", label: "Institutions" },
  { href: "/tourism", label: "Places to visit" },
  { href: "/notices", label: "Notices" },
];

const CONTACT = { href: "/contact", label: "Contact" };

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const moreActive = MORE.some((l) => isActive(l.href));

  useEffect(() => {
    setMoreOpen(false);
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const linkClass = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition ${
      active ? "bg-white/10 text-primary" : "text-cream/80 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-4 md:pt-6">
        <nav
          aria-label="Main"
          className="flex w-full max-w-6xl items-center gap-3 rounded-2xl border border-white/10 bg-ink/45 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur-md md:px-5"
        >
          <Link
            href="/"
            className="flex shrink-0 select-none items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Image
              alt={`${PARISH.name} logo`}
              src="/Logo.png"
              height={48}
              width={48}
              className="h-11 w-11 object-contain md:h-12 md:w-12"
              priority
            />
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold text-cream md:text-xl">St. Joseph Church</span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary">Belman</span>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-0.5 lg:flex">
            {MAIN.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={linkClass(isActive(link.href))}
              >
                {link.label}
              </Link>
            ))}

            <div ref={moreRef} className="relative">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-controls="more-menu"
                onClick={() => setMoreOpen((o) => !o)}
                className={`${linkClass(moreActive)} inline-flex items-center gap-1`}
              >
                Parish <ChevronDown size={14} className={`transition ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.ul
                    id="more-menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-ink/95 p-2 shadow-2xl backdrop-blur-md"
                  >
                    {MORE.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={isActive(link.href) ? "page" : undefined}
                          className={`block rounded-xl px-4 py-2.5 text-sm transition ${
                            isActive(link.href) ? "bg-white/10 text-primary" : "text-cream/85 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={CONTACT.href}
              aria-current={isActive(CONTACT.href) ? "page" : undefined}
              className={linkClass(isActive(CONTACT.href))}
            >
              {CONTACT.label}
            </Link>
            <Link
              href="/donate"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
            >
              <HandHeart size={16} aria-hidden /> Donate
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="ml-auto rounded-xl p-2 text-cream lg:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={26} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-ink px-6 pb-10 pt-6"
          >
            <div className="flex justify-end">
              <button type="button" aria-label="Close menu" className="rounded-xl p-2 text-cream" onClick={() => setIsOpen(false)}>
                <X size={30} />
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-4 flex flex-1 flex-col">
              {[...MAIN, CONTACT].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`block border-b border-white/10 py-3.5 font-serif text-3xl font-semibold ${
                      isActive(link.href) ? "text-primary" : "text-cream"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Parish</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {MORE.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`rounded-xl border border-white/10 px-3 py-3 text-sm ${
                      isActive(link.href) ? "bg-white/10 text-primary" : "text-cream/85"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <Link
              href="/donate"
              onClick={() => setIsOpen(false)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-ink"
            >
              <HandHeart size={18} aria-hidden /> Donate
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
