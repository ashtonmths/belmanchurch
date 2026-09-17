"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Images,
  LogIn,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "~/components/Button";
import { useRole } from "~/hooks/useRole";

export default function Home() {
  const router = useRouter();
  const role = useRole();
  const [massModal, setMassModal] = useState(false);

  const accountAction =
    role === "ADMIN" || role === "DEVELOPER"
      ? { label: "Open administration", icon: ShieldCheck, href: "/admin" }
      : role === "PHOTOGRAPHER"
        ? { label: "Upload photographs", icon: Images, href: "/admin/gallery" }
        : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#17110c] text-white">
      <div className="absolute inset-0 bg-[url('/bg/home.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#17110c]/90 via-transparent to-black/25" />

      <section className="relative mx-auto flex min-h-screen max-w-[90rem] items-center px-5 pb-12 pt-28 sm:px-8 lg:px-12 lg:pb-16 lg:pt-32">
        <div className="grid w-full items-end gap-12 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              A parish rooted in faith, family and service.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Button
                onClick={() => setMassModal(true)}
                className="border-[#f0c878] bg-[#f0c878] px-6 text-[#2a1b10] hover:bg-[#e5b95f]"
              >
                <Clock3 aria-hidden="true" size={18} />
                Mass timings
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/events")}
                className="border-white/35 px-6 text-white hover:border-white/60 hover:bg-white/10"
              >
                <CalendarDays aria-hidden="true" size={18} />
                Parish events
              </Button>
              {!role ? (
                <Button
                  variant="ghost"
                  onClick={() => signIn("google")}
                  className="px-4 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <LogIn aria-hidden="true" size={18} />
                  Sign in
                </Button>
              ) : accountAction ? (
                <Button
                  variant="ghost"
                  onClick={() => router.push(accountAction.href)}
                  className="px-4 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <accountAction.icon aria-hidden="true" size={18} />
                  {accountAction.label}
                </Button>
              ) : null}
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="border-l border-white/20 bg-black/25 p-6 backdrop-blur-md sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0c878]">
              This Sunday
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">Holy Mass</p>
            <div className="mt-6 space-y-5 border-y border-white/15 py-5">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 shrink-0 text-[#f0c878]" size={19} />
                <div>
                  <p className="font-semibold text-white">7:30 AM</p>
                  <p className="mt-1 text-sm text-white/55">Morning Mass</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 shrink-0 text-[#f0c878]" size={19} />
                <div>
                  <p className="font-semibold text-white">10:30 AM</p>
                  <p className="mt-1 text-sm text-white/55">After catechism</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-[#f0c878]" size={19} />
                <p className="text-sm leading-6 text-white/65">
                  St. Joseph Church, Belman
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMassModal(true)}
              className="group mt-5 flex min-h-11 w-full items-center justify-between rounded-full border border-white/25 px-5 py-2 text-left text-sm font-bold text-white transition hover:border-[#f0c878] hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878]"
            >
              See the full weekly schedule
              <ArrowRight
                aria-hidden="true"
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </motion.aside>
        </div>
      </section>

      <AnimatePresence>
        {massModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setMassModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="relative my-8 w-full max-w-3xl bg-[#fffaf1] p-6 text-[#3b2919] shadow-2xl sm:p-9"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setMassModal(false)}
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[#3b2919]/20 text-[#3b2919] transition hover:border-[#3b2919] hover:bg-[#3b2919] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-6 sm:top-6"
                aria-label="Close mass timings"
              >
                <X aria-hidden="true" size={21} />
              </button>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Worship & parish office
              </p>
              <h2 className="mt-2 pr-14 text-3xl font-bold sm:text-4xl">
                Weekly schedule
              </h2>

              <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                <ScheduleBlock title="Mass timings">
                  <p>Weekdays — 6:30 AM</p>
                  <p>Saturday — 4:00 PM</p>
                  <p>Sunday — 7:30 AM & 10:30 AM</p>
                  <p className="mt-2 text-sm text-[#3b2919]/60">
                    10:00 AM when there is no catechism
                  </p>
                </ScheduleBlock>
                <ScheduleBlock title="Catechism">
                  <p>Sunday — 9:15 AM to 10:30 AM</p>
                </ScheduleBlock>
                <ScheduleBlock title="St. Anthony Shrine, Pakala">
                  <p>Tuesday — 4:00 PM</p>
                  <p>First Tuesday — 3:00 PM</p>
                </ScheduleBlock>
                <ScheduleBlock title="Parish office">
                  <p>Weekdays — 9:00 AM to 1:00 PM</p>
                  <p>2:00 PM to 5:00 PM</p>
                  <a
                    href="tel:+919141031604"
                    className="mt-3 inline-block font-bold text-accent underline decoration-accent/30 underline-offset-4"
                  >
                    +91 91410 31604
                  </a>
                  <p className="mt-1 text-sm text-[#3b2919]/60">
                    Closed on Sunday
                  </p>
                </ScheduleBlock>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ScheduleBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#3b2919]/20 pt-4">
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <div className="space-y-1.5 text-base leading-6 text-[#3b2919]/75">
        {children}
      </div>
    </section>
  );
}
