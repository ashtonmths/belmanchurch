"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock, HandHeart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import NextMass from "~/components/home/NextMass";
import { PARISH, PARISH_MOTTO } from "~/lib/parish";
import type { HeroTint, ServiceItem } from "~/lib/site-content";

export type Slide = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
};

const FALLBACK: Slide[] = [
  { id: "fallback", imageUrl: "/bg/home.jpg", title: null, subtitle: null },
];
const INTERVAL_MS = 6500;

export default function HeroCarousel({
  slides: provided,
  massTimings,
  tint,
}: {
  slides: Slide[];
  massTimings: ServiceItem[];
  tint: HeroTint;
}) {
  const slides = provided.length ? provided : FALLBACK;
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || reduceMotion || slides.length < 2) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, slides.length, next]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Photos of the parish"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate flex min-h-[100svh] w-full items-end overflow-hidden bg-ink"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 -z-20 transition-opacity duration-[1400ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title ?? "St. Joseph Church, Belman"}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover ${
              i === index ? "motion-safe:animate-[slow-zoom_9s_ease-out_forwards]" : ""
            }`}
          />
        </div>
      ))}
      {/* Colour tint chosen in Admin > Homepage carousel */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: tint.color, opacity: tint.strength / 100 }}
      />
      {/* Keeps the heading and cards readable whatever the tint */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-ink" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-40 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <motion.p
            {...rise(0.1)}
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
          >
            <span className="h-px w-10 bg-primary" aria-hidden />
            {PARISH_MOTTO.latin} · Since {PARISH.founded}
          </motion.p>

          <motion.h1
            {...rise(0.25)}
            className="mt-6 font-serif text-5xl font-semibold leading-[0.95] text-white drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl"
          >
            St. Joseph Church
            <span className="block italic text-primary">Belman</span>
          </motion.h1>

          <motion.p
            {...rise(0.4)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow md:text-xl"
          >
            A Catholic parish family in Udupi District, gathering in faith,
            worship and service for more than a century.
          </motion.p>

          <motion.div {...rise(0.55)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#mass-timings"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-ink shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white"
            >
              <Clock size={18} aria-hidden /> Mass Timings
            </a>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              Our Story
            </Link>
            <Link
              href="/donate"
              className="hidden items-center gap-2 rounded-full px-4 py-3 font-semibold text-primary transition hover:text-white sm:inline-flex"
            >
              <HandHeart size={18} aria-hidden /> Give
            </Link>
          </motion.div>
        </div>

        <motion.div {...rise(0.8)} className="md:mb-2">
          <NextMass timings={massTimings} />
        </motion.div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-7 z-10 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : (
        <a
          href="#welcome"
          aria-label="Scroll to welcome"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/60 transition hover:text-white md:block"
        >
          <ChevronDown size={28} className="motion-safe:animate-bounce" />
        </a>
      )}
    </section>
  );
}
