"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "~/hooks/useRole";

const allLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/donation", label: "Donations" },
  { href: "/admin/families", label: "Families" },
  { href: "/admin/misc", label: "Publishing" },
  { href: "/admin/mass", label: "Mass times" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/priests", label: "Priests" },
  { href: "/admin/settings", label: "Settings" },
];
export default function AdminNavbar() {
  const pathname = usePathname();
  const role = useRole();
  const [open, setOpen] = useState(false);
  const links = role === "PHOTOGRAPHER" ? allLinks.slice(-1) : allLinks;
  const active = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 to-transparent" />
      <nav
        className="pointer-events-auto relative mx-auto flex h-24 max-w-[96rem] items-center px-4 sm:px-6 xl:px-8"
        aria-label="Administration"
      >
        <Link
          href={role === "PHOTOGRAPHER" ? "/admin/gallery" : "/admin"}
          className="flex items-center gap-3"
        >
          <Image
            src="/Logo.png"
            alt="St. Joseph Church crest"
            width={58}
            height={58}
            className="h-12 w-12 object-contain drop-shadow-lg sm:h-14 sm:w-14"
            priority
          />
          <span className="border-l border-white/30 pl-3 leading-none">
            <span className="block text-lg font-semibold tracking-wide text-white sm:text-xl">
              St. Joseph Church
            </span>
            <span className="mt-1 block text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#f0c878]">
              Administration
            </span>
          </span>
        </Link>
        <div className="ml-auto hidden items-center gap-3 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative whitespace-nowrap py-3 text-[0.92rem] font-semibold tracking-wide transition after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-[#f0c878] ${active(link.href) ? "text-white after:scale-x-100" : "text-white/65 after:scale-x-0 hover:text-white hover:after:scale-x-100"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-1 inline-flex items-center gap-2 rounded-full border border-[#f0c878] px-4 py-2.5 text-sm font-semibold text-[#f0c878] transition hover:bg-[#f0c878] hover:text-[#211811]"
          >
            View site <ArrowUpRight size={16} />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/20 text-white xl:hidden"
          aria-label="Open administration menu"
        >
          <Menu size={24} />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="ml-auto flex h-full w-[88%] max-w-sm flex-col bg-[#1d1510] px-6 py-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-lg font-semibold text-white">
                  Administration
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`border-b border-white/10 py-4 text-lg font-medium ${active(link.href) ? "text-[#f0c878]" : "text-white/70"}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 py-3.5 font-semibold text-[#211811]"
              >
                View website <ArrowUpRight size={17} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
