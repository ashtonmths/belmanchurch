/* eslint-disable @next/next/no-img-element */
"use client";

import { api } from "~/trpc/react";

const history = [
  [
    "1886",
    "Permission was granted by Bishop N. M. Pagani to build a chapel in Belman.",
  ],
  [
    "1887",
    "Work began on St. Joseph's Chapel on land that belonged to the Madkamane family.",
  ],
  [
    "1894",
    "Belman became a separate parish, with Fr. N. Carneiro serving as its first parish priest.",
  ],
  [
    "1900",
    "The parish boundary with Kirem was settled and more local Catholic families joined Belman parish.",
  ],
  [
    "1933",
    "The present church was built under Fr. Denis R. Lewis, drawing inspiration from Gloria Church in Mumbai.",
  ],
  [
    "2019",
    "A major restoration preserved the church facade, pillars and belfry while renewing the building for parish use.",
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
  const { data: priests = [] } = api.misc.getAllPriests.useQuery();
  const parishPriests = priests.filter(({ role }) => role === "PARISH_PRIEST");
  const assistantPriests = priests.filter(
    ({ role }) => role === "ASSISTANT_PRIEST",
  );

  return (
    <main className="bg-[#f4f1ea] font-sans text-[#28231e]">
      <header className="relative flex min-h-[62vh] items-end overflow-hidden bg-[#17110c] px-5 pb-12 pt-28 text-white sm:px-8 sm:pb-16 lg:px-12">
        <div className="absolute inset-0 bg-[url('/bg/home.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />
        <div className="relative mx-auto w-full max-w-6xl">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            St. Joseph Church, Belman
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            A Catholic parish serving Belman and the surrounding villages since
            1894.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <section className="grid gap-10 border-b border-[#28231e]/20 pb-14 md:grid-cols-[1.4fr_0.6fr] md:gap-16">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">The parish</h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-[#514a43]">
              <p>
                Belman parish was established on 10 September 1894. Today it
                serves about 2,156 Catholics in 581 families across 21 wards.
                The parish also publishes the newsletter San Zuzechi Bethkati.
              </p>
              <p>
                The church stands on the Padubidri–Kudremukh State Highway,
                about 48 kilometres north of Mangaluru. The name Belman comes
                from the Kannada words “bili mannu”, meaning white soil.
              </p>
            </div>
          </div>
          <dl className="border-t border-[#28231e]/20 text-sm md:border-t-0">
            <Fact label="Established" value="10 September 1894" />
            <Fact label="Families" value="581" />
            <Fact label="Wards" value="21" />
            <Fact label="Diocese" value="Udupi" />
          </dl>
        </section>

        <section className="border-b border-[#28231e]/20 py-14 sm:py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            A short history
          </h2>
          <div className="mt-8">
            {history.map(([year, text]) => (
              <div
                key={year}
                className="grid gap-2 border-t border-[#28231e]/15 py-5 sm:grid-cols-[8rem_1fr] sm:gap-8"
              >
                <p className="font-semibold text-[#765827]">{year}</p>
                <p className="leading-7 text-[#514a43]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <PriestSection title="Parish priests" priests={parishPriests} />
        <PriestSection
          title="Assistant parish priests"
          priests={assistantPriests}
        />

        <section className="border-b border-[#28231e]/20 py-14 sm:py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Parish associations
          </h2>
          <ul className="mt-8 grid border-t border-[#28231e]/15 sm:grid-cols-2 lg:grid-cols-3">
            {associations.map((name) => (
              <li
                key={name}
                className="border-b border-[#28231e]/15 py-4 text-[#514a43] sm:mr-8"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>

        <section className="py-14 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                St. Anthony&apos;s Shrine
              </h2>
              <p className="mt-3 text-sm text-[#765827]">
                Pakala, Manjarapalke
              </p>
            </div>
            <div className="space-y-5 text-base leading-8 text-[#514a43]">
              <p>
                The shrine began with a wooden statue of St. Anthony found in a
                bundle of firewood and kept with reverence by the D&apos;Silva
                family of Pakala. Devotion grew among people from Belman and
                nearby villages, who came to pray and offer candles.
              </p>
              <p>
                A public place of worship was later built with the support of
                the local community and the parish. The present shrine was
                blessed and opened on 13 July 1974. Its annual feast is observed
                on 13 June.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-[#28231e]/20 py-4">
      <dt className="text-[#6b645d]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
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
    <section className="border-b border-[#28231e]/20 py-14 sm:py-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {priests.map((priest) => (
          <article
            key={priest.id}
            className="flex items-center gap-4 border-t border-[#28231e]/15 py-4"
          >
            {priest.imageUrl ? (
              <img
                src={priest.imageUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-[#ded8cc]" />
            )}
            <div>
              <h3 className="font-medium">{priest.name}</h3>
              <p className="mt-1 text-sm text-[#6b645d]">{priest.period}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
