/* eslint-disable @next/next/no-img-element */
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { api } from "~/trpc/react";

const history = [
  [
    "16th century",
    "Faith reaches the coast",
    "Christianity took root in the district and grew strong through the 17th and 18th centuries.",
  ],
  [
    "1784 to 1789",
    "Captivity and return",
    "Coastal Christians, the Mathias family among them, were taken captive by Tipu Sultan's soldiers. After their release in 1789 the family returned to Belman and settled around Naniltar.",
  ],
  [
    "1886",
    "Permission for a chapel",
    "On 29 November, Bishop N. M. Pagani, S.J. of Mangalore sanctioned a chapel for the Christians of Belman, then part of Shirva parish.",
  ],
  [
    "1887",
    "Building begins",
    "Work started at Madkamane, beside the present church, with the Mathias family meeting the cost.",
  ],
  [
    "1894",
    "A parish is born",
    "On 10 September the chapel, with its mud walls and thatched roof, was blessed, and Belman became a parish in its own right, with Fr. Nicholas Carneiro as its first parish priest.",
  ],
  [
    "1896",
    "The first school",
    "Fr. Carneiro opened a school in a small mud-and-stone hut on the church grounds, the beginning of St. Joseph's Higher Primary School.",
  ],
  [
    "1900",
    "Boundaries settled",
    "Families from N.S. De Saude, Shirva and N.S. Remedies, Kirem joined the parish; the boundary with Kirem was fixed on 12 December.",
  ],
  [
    "1933",
    "The present church",
    "Under Fr. Denis R. Lewis the present church rose on its hillock, its tall art-deco façade still the landmark of Belman.",
  ],
  [
    "1974",
    "St. Anthony's Shrine",
    "The shrine at Pakala was blessed on 13 July, giving the miraculous statue of St. Anthony a home open to all.",
  ],
  [
    "1982",
    "St. Joseph's High School",
    "The parish high school opened on 2 June.",
  ],
  [
    "2019",
    "Restored to its glory",
    "Led by Fr. Edwin D'Souza, a major restoration renewed the façade, pillars and belfry while preserving the church's heritage.",
  ],
  [
    "Today",
    "A living parish",
    "About 2,156 Catholics in 581 families across 21 wards, with the monthly newsletter San Zuzechi Betkati.",
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
          className="border-b border-white/15 py-16 md:py-24"
        >
          <div className="grid gap-10 md:grid-cols-[0.65fr_1.35fr] md:gap-20">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Roots in Shirva
            </h2>
            <div className="space-y-5 leading-8 text-white/65">
              <p>
                The name Belman comes from the Kannada <em>bili mannu</em>,
                white soil. The village sits between Padubidri and Karkala in
                Udupi District, among paddy fields, coconut groves, hills and
                valleys, 48 km north of Mangalore on the State Highway from
                Padubidri to Kudremukh.
              </p>
              <p>
                Christianity reached this coast in the 16th century and
                flourished until Tipu Sultan&apos;s captivity at the end of the
                18th. Those who survived came home and rebuilt their parishes.
                Belman&apos;s families belonged to Shirva, where two churches
                then stood: N.S. De Saude under the Padroado, with its bishop in
                Goa, and St. Francis Xavier&apos;s under the Propaganda
                congregation of Rome, the church most Belman families attended.
              </p>
            </div>
          </div>
        </section>

        <section
          data-reveal
          className="border-b border-white/15 py-16 md:py-24"
        >
          <div className="grid gap-10 md:grid-cols-[0.65fr_1.35fr] md:gap-20">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              A chapel of mud and thatch
            </h2>
            <div className="space-y-5 leading-8 text-white/65">
              <p>
                On 29 November 1886, Bishop N. M. Pagani, S.J. of Mangalore gave
                permission for a chapel in Belman. A site called Madkamane, next
                to where the church stands today, was chosen, and building began
                in 1887 with the Mathias family meeting the cost. Seven years
                later, on 10 September 1894, the chapel was blessed, and the
                same decree made Belman a parish of its own under Fr. Nicholas
                Carneiro.
              </p>
              <p>
                It was a humble start: mud walls, a thatched roof, no
                priest&apos;s house and no belfry. Sunday Mass was at 7 a.m.,
                and the parish was cared for from Shirva. Families from N.S. De
                Saude and from N.S. Remedies, Kirem soon asked to join, and on
                12 December 1900 the boundary with Kirem was settled.
              </p>
            </div>
          </div>
        </section>

        <section
          data-reveal
          className="grid gap-10 border-b border-white/15 py-16 md:grid-cols-[0.65fr_1.35fr] md:gap-20 md:py-24"
        >
          <h2 className="text-2xl font-semibold sm:text-3xl">
            The church on the hill
          </h2>
          <div>
            <div className="space-y-5 leading-8 text-white/65">
              <p>
                The present church, completed in 1933 under Fr. Denis R. Lewis,
                stands on a small hillock with its tall art-deco façade. A
                careful restoration led by Fr. Edwin D&apos;Souza in 2019
                renewed the façade, pillars and belfry while preserving the
                character that generations of parishioners have prayed in.
              </p>
              <p>
                Today the parish numbers about 2,156 Catholics in 581 families
                across 21 wards. Its newsletter is San Zuzechi Betkati, and
                among its sons is the late Bishop Baptist Mudartha, Bishop of
                Allahabad.
              </p>
            </div>
            <dl className="mt-10 grid border-t border-white/15 text-sm sm:grid-cols-2">
              <Fact label="Established" value="1894" />
              <Fact label="Families" value="581" />
              <Fact label="Wards" value="21" />
              <Fact label="Diocese" value="Udupi" />
            </dl>
          </div>
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
              The altar of St. Joseph
            </h2>
            <div className="mt-7 divide-y divide-white/15 border-y border-white/15">
              <div className="py-5">
                <h3 className="font-medium text-white">The nave</h3>
                <p className="mt-2 leading-7 text-white/60">
                  A place of prayer shaped by the parish&apos;s long history and
                  restored for present-day worship.
                </p>
              </div>
              <div className="py-5">
                <h3 className="font-medium text-white">Sunday Mass</h3>
                <p className="mt-2 leading-7 text-white/60">
                  7:30 a.m. and 10:30 a.m.; 10:00 a.m. when there is no
                  catechism.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          data-reveal
          className="border-b border-white/15 py-16 md:py-24"
        >
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Through the years
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {history.map(([year, title, text]) => (
              <article
                key={year}
                className="min-h-52 rounded-2xl border border-white/10 bg-[#211811] p-6 sm:p-7"
              >
                <p className="text-sm font-semibold text-[#f0c878]">{year}</p>
                <h3 className="mt-5 text-xl font-medium text-white">{title}</h3>
                <p className="mt-3 leading-7 text-white/60">{text}</p>
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
            {associations.map((name) => (
              <div
                key={name}
                className="flex min-h-24 items-center gap-4 bg-[#211811] px-5 py-4"
              >
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
