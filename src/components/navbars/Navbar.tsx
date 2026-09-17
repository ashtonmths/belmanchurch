"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Parish" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/bethkati", label: "Bethkati" },
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
          {links.map((link) => (
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
            className="pointer-events-auto fixed inset-0 z-50 bg-[#17110c]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex h-full flex-col px-6 py-6 sm:px-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <Link href="/" className="flex items-center gap-3">
                  <Image alt="" src="/Logo.png" height={50} width={50} />
                  <span className="text-xl font-semibold text-white">
                    St. Joseph Church
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white transition hover:border-[#f0c878] hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878]"
                  aria-label="Close navigation menu"
                >
                  <X aria-hidden="true" size={24} />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/10"
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`flex items-center justify-between py-4 text-2xl font-semibold transition sm:text-3xl ${
                        isActive(link.href)
                          ? "text-[#f0c878]"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <span className="font-sans text-xs font-bold tracking-widest text-white/30">
                        0{index + 1}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/donate"
                className="rounded-full bg-[#f0c878] px-5 py-4 text-center font-bold text-[#2a1b10]"
              >
                Make a donation
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
