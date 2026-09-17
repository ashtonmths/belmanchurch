"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/bethkati", label: "Bethkati" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [parishOpen, setParishOpen] = useState(false);

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
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 to-transparent" />
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto relative mx-auto flex h-24 max-w-[90rem] items-center px-5 sm:px-8 lg:px-12"
      >
        <Link
          href="/"
          aria-label="St. Joseph Church Belman, home"
          className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878]"
        >
          <Image
            alt="St. Joseph Church crest"
            src="/Logo.png"
            height={58}
            width={58}
            className="h-12 w-12 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14"
            priority
          />
          <span className="border-l border-white/30 pl-3 leading-none">
            <span className="block text-lg font-semibold tracking-wide text-white sm:text-xl">
              St. Joseph Church
            </span>
            <span className="mt-1 block text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#f0c878]">
              Belman Parish
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-7 lg:flex">
          {links.slice(0, 1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative py-3 text-sm font-semibold tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[#f0c878] after:transition-transform ${
                isActive(link.href)
                  ? "text-white after:scale-x-100"
                  : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button
              type="button"
              className={`flex items-center gap-1 py-3 text-sm font-semibold tracking-wide transition-colors ${pathname.startsWith("/about") || pathname.startsWith("/st-anthony") ? "text-white" : "text-white/70 hover:text-white"}`}
            >
              Our Parish
              <ChevronDown
                size={15}
                className="transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
              />
            </button>
            <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 translate-y-2 rounded-2xl border border-white/10 bg-[#211811] p-2 opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link
                href="/about"
                className="block rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white"
              >
                St. Joseph Church
              </Link>
              <Link
                href="/st-anthony"
                className="block rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white"
              >
                St. Anthony Chapel
              </Link>
            </div>
          </div>
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative py-3 text-sm font-semibold tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[#f0c878] after:transition-transform ${isActive(link.href) ? "text-white after:scale-x-100" : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/donate"
            className="rounded-full border border-[#f0c878] bg-[#f0c878] px-5 py-3 text-sm font-bold text-[#2a1b10] shadow-[0_8px_30px_rgba(240,200,120,0.2)] transition hover:bg-transparent hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Make a donation
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ml-auto grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition hover:border-[#f0c878] hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878] lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <Menu aria-hidden="true" size={25} />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            className="pointer-events-auto fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="ml-auto flex h-full w-[88%] max-w-sm flex-col bg-[#1d1510] px-6 pb-7 pt-6 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <Link href="/" className="flex items-center gap-3">
                  <Image alt="" src="/Logo.png" height={44} width={44} />
                  <span className="text-base font-semibold text-white">
                    St. Joseph Church
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#f0c878] hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878]"
                  aria-label="Close navigation menu"
                >
                  <motion.span
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    <X aria-hidden="true" size={21} />
                  </motion.span>
                </button>
              </div>

              <motion.div
                className="flex flex-1 flex-col justify-center py-8"
                initial="closed"
                animate="open"
                variants={{
                  closed: {},
                  open: {
                    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
                  },
                }}
              >
                {links.slice(0, 1).map((link) => (
                  <motion.div
                    key={link.href}
                    className="border-b border-white/10"
                    variants={{
                      closed: { opacity: 0, x: 18 },
                      open: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`block py-4 text-lg font-medium transition ${
                        isActive(link.href)
                          ? "text-[#f0c878]"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  className="border-b border-white/10"
                  variants={{
                    closed: { opacity: 0, x: 18 },
                    open: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <button
                    type="button"
                    onClick={() => setParishOpen((open) => !open)}
                    className={`flex w-full items-center justify-between py-4 text-lg font-medium ${pathname.startsWith("/about") || pathname.startsWith("/st-anthony") ? "text-[#f0c878]" : "text-white/75"}`}
                    aria-expanded={parishOpen}
                  >
                    Our Parish
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${parishOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {parishOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pb-4 pl-4">
                          <Link
                            href="/about"
                            className="block py-2 text-sm text-white/65"
                          >
                            St. Joseph Church
                          </Link>
                          <Link
                            href="/st-anthony"
                            className="block py-2 text-sm text-white/65"
                          >
                            St. Anthony Chapel
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                {links.slice(1).map((link) => (
                  <motion.div
                    key={link.href}
                    className="border-b border-white/10"
                    variants={{
                      closed: { opacity: 0, x: 18 },
                      open: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`block py-4 text-lg font-medium transition ${isActive(link.href) ? "text-[#f0c878]" : "text-white/75 hover:text-white"}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.3 }}
              >
                <Link
                  href="/donate"
                  className="block rounded-full bg-[#f0c878] px-5 py-3.5 text-center text-sm font-semibold text-[#2a1b10]"
                >
                  Make a donation
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
