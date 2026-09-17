/* eslint-disable @next/next/no-img-element */
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { api } from "~/trpc/react";

const history = [
  [
    "1886",
    "Bishop N. M. Pagani granted permission to build a chapel in Belman.",
  ],
  [
    "1887",
    "Construction began on land belonging to the Madkamane family, with support from the Mathias family.",
  ],
  [
    "1894",
    "Belman was established as a separate parish. Fr. N. Carneiro became the first parish priest.",
  ],
  [
    "1900",
    "The parish boundary with Kirem was settled and the Catholic community continued to grow.",
  ],
  ["1933", "The present church was completed under Fr. Denis R. Lewis."],
  [
    "2019",
    "The church was carefully restored while retaining its facade, pillars and belfry.",
  ],
] as const;

const associations = [
  "ICYM and YCS",
  "Altar Servers",
  "Marian Sodality",
  "Missionary Childhood Association",
  "Catholic Sabha",
  "Secular Franciscan Order",
  "St. Vincent de Paul Society",
  "Women's Association",
  "Bethkati UAE and Kuwait",
];

export default function About() {
  const pageRef = useRef<HTMLElement>(null);
  const facadeRef = useRef<HTMLImageElement>(null);
  const altarRef = useRef<HTMLImageElement>(null);
  const { data: priests = [] } = api.misc.getAllPriests.useQuery();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.from("[data-hero-copy]", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      if (facadeRef.current) {
        gsap.to(facadeRef.current, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: facadeRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (altarRef.current) {
        gsap.fromTo(
          altarRef.current,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: altarRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, pageRef);

    return () => context.revert();
  }, []);

  const parishPriests = priests.filter(({ role }) => role === "PARISH_PRIEST");
  const assistantPriests = priests.filter(
    ({ role }) => role === "ASSISTANT_PRIEST",
  );

  return (
    <main
      ref={pageRef}
      className="overflow-hidden bg-[#17110c] font-sans text-white"
    >
      <header className="relative flex min-h-[78vh] items-end overflow-hidden px-5 pb-14 pt-28 sm:px-8 sm:pb-20 lg:px-12">
        <img
          ref={facadeRef}
          src="/bg/facade.jpg"
          alt="Facade of St. Joseph Church, Belman"
          className="absolute inset-0 h-[110%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17110c] via-black/35 to-black/45" />
        <div data-hero-copy className="relative mx-auto w-full max-w-6xl">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Our parish
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            St. Joseph Church has served Belman and its neighbouring villages
            since 1894.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 lg:px-12">
        <section
          data-reveal
          className="grid gap-10 border-b border-white/15 py-16 md:grid-cols-[1.3fr_0.7fr] md:gap-20 md:py-24"
        >
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              A parish built by its people
            </h2>
            <div className="mt-6 max-w-2xl space-y-5 leading-8 text-white/65">
              <p>
                Belman parish was established on 10 September 1894. Today it
                serves about 2,156 Catholics in 581 families across 21 wards.
              </p>
              <p>
                The church stands on the Padubidri–Kudremukh State Highway,
                about 48 kilometres north of Mangaluru. The parish publishes San
                Zuzechi Bethkati for parishioners in Belman and abroad.
              </p>
            </div>
          </div>
          <dl className="border-t border-white/15 text-sm md:border-t-0">
            <Fact label="Established" value="1894" />
            <Fact label="Families" value="581" />
            <Fact label="Wards" value="21" />
            <Fact label="Diocese" value="Udupi" />
          </dl>
        </section>

        <section
          data-reveal
          className="grid gap-10 border-b border-white/15 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-24"
        >
          <div className="overflow-hidden rounded-2xl">
            <img
              ref={altarRef}
              src="/bg/altar.jpg"
              alt="Altar of St. Joseph Church, Belman"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              The church today
            </h2>
            <p className="mt-6 leading-8 text-white/65">
              The present church was built in 1933 under Fr. Denis R. Lewis. Its
              distinctive facade and interior were restored in 2019, preserving
              the character of the building while preparing it for the next
              generation of parish life.
            </p>
            <p className="mt-5 leading-8 text-white/65">
              The parish remains a centre for worship, catechism, family life
              and community service throughout the week.
            </p>
          </div>
        </section>

        <section
          data-reveal
          className="border-b border-white/15 py-16 md:py-24"
        >
          <h2 className="text-2xl font-semibold sm:text-3xl">Parish history</h2>
          <div className="relative mt-10 border-l border-[#f0c878]/45 pl-7 sm:pl-10">
            {history.map(([year, text]) => (
              <article key={year} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[2.05rem] top-1 h-2.5 w-2.5 rounded-full bg-[#f0c878] sm:-left-[2.82rem]" />
                <p className="font-semibold text-[#f0c878]">{year}</p>
                <p className="mt-2 max-w-3xl leading-7 text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <PriestSection title="Parish priests" priests={parishPriests} />
        <PriestSection
          title="Assistant parish priests"
          priests={assistantPriests}
        />

        <section
          data-reveal
          className="border-b border-white/15 py-16 md:py-24"
        >
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Parish associations
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {associations.map((name, index) => (
              <div
                key={name}
                className="flex min-h-24 items-center gap-4 bg-[#211811] px-5 py-4"
              >
                <span className="text-sm text-[#f0c878]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-medium text-white/85">{name}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          data-reveal
          className="grid gap-10 py-16 md:grid-cols-[0.65fr_1.35fr] md:gap-20 md:py-24"
        >
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              St. Anthony&apos;s Shrine
            </h2>
            <p className="mt-3 text-sm text-[#f0c878]">Pakala, Manjarpalke</p>
          </div>
          <div className="space-y-5 leading-8 text-white/65">
            <p>
              The shrine began with a wooden statue of St. Anthony kept by the
              D&apos;Silva family of Pakala. As devotion grew, people from
              Belman and nearby villages came to pray and offer candles.
            </p>
            <p>
              A public place of worship was built with the support of the
              community and the parish. The shrine was blessed and opened on 13
              July 1974, and its annual feast is observed on 13 June.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-white/15 py-4">
      <dt className="text-white/50">{label}</dt>
      <dd className="font-medium text-white">{value}</dd>
    </div>
  );
}

type Priest = {
  id: string;
  name: string;
  period: string;
  imageUrl: string | null;
};

function PriestSection({
  title,
  priests,
}: {
  title: string;
  priests: Priest[];
}) {
  if (!priests.length) return null;
  return (
    <section data-reveal className="border-b border-white/15 py-16 md:py-24">
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {priests.map((priest) => (
          <article
            key={priest.id}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4"
          >
            {priest.imageUrl ? (
              <img
                src={priest.imageUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/10" />
            )}
            <div>
              <h3 className="font-medium text-white">{priest.name}</h3>
              <p className="mt-1 text-sm text-white/50">{priest.period}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
