import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "~/components/Footer";
import PageHero from "~/components/PageHero";
import Reveal from "~/components/home/Reveal";
import { PARISH_TIMELINE } from "~/lib/history";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

type Priest = { id: string; name: string; period: string; imageUrl: string | null; isCurrent: boolean };

function PriestGrid({ priests }: { priests: Priest[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {priests.map((p) => (
        <li
          key={p.id}
          className={`flex flex-col items-center rounded-3xl border bg-white p-5 text-center ${
            p.isCurrent ? "border-accent shadow-lg shadow-accent/15" : "border-accent/10"
          }`}
        >
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.name}
              width={112}
              height={112}
              className="h-28 w-28 rounded-full object-cover object-top"
            />
          ) : (
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/30 text-accent">
              <UserRound size={40} aria-hidden />
            </span>
          )}
          <p className="mt-4 font-serif text-lg font-semibold leading-snug text-ink">{p.name}</p>
          <p className="mt-1 text-sm text-textcolor/70">{p.period}</p>
          {p.isCurrent && (
            <span className="mt-2 rounded-full bg-primary/40 px-3 py-0.5 text-xs font-semibold text-accent">
              Serving now
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function AboutPage() {
  const priests = await db.priest.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, period: true, imageUrl: true, isCurrent: true, role: true },
  });
  const parish = priests.filter((p) => p.role === "PARISH_PRIEST");
  const assistants = priests.filter((p) => p.role === "ASSISTANT_PRIEST");

  return (
    <>
      <PageHero
        eyebrow="Since 1894"
        title="Our story"
        description="From a mud-walled chapel with a thatched roof to the landmark church on the hill: the history of St. Joseph's, Belman."
        image="/carousel/facade.jpg"
        imageAlt="The façade of St. Joseph Church, Belman"
      />

      <main>
        <section className="bg-cream px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.2fr_1fr]">
            <Reveal className="hyphens-auto space-y-6 text-justify text-lg leading-relaxed text-textcolor/90">
              <h2 className="font-serif text-4xl font-semibold text-ink">Roots in Shirva</h2>
              <p>
                The name Belman comes from the Kannada <em>bili mannu</em>, “white soil”. The village sits between
                Padubidri and Karkala in Udupi District, among paddy fields, coconut groves, hills and valleys, 48 km
                north of Mangalore on the State Highway from Padubidri to Kudremukh.
              </p>
              <p>
                Christianity reached this coast in the 16th century and flourished until Tipu Sultan&rsquo;s captivity at
                the end of the 18th. Those who survived came home and rebuilt their parishes. Belman&rsquo;s families
                belonged to Shirva, where two churches then stood: N.S. De Saude under the Padroado, with its bishop
                in Goa, and St. Francis Xavier&rsquo;s under the Propaganda congregation of Rome, the church most Belman
                families attended.
              </p>
              <h2 className="pt-4 font-serif text-4xl font-semibold text-ink">A chapel of mud and thatch</h2>
              <p>
                On 29 November 1886, Bishop N. M. Pagani, S.J. of Mangalore gave permission for a chapel in Belman.
                A site called ‘Madkamane’, next to where the church stands today, was chosen, and building began in
                1887 with the Mathias family meeting the cost. Seven years later, on 10 September 1894, the chapel
                was blessed, and the same decree made Belman a parish of its own under Fr. Nicholas Carneiro.
              </p>
              <p>
                It was a humble start: mud walls, a thatched roof, no priest&rsquo;s house and no belfry. Sunday Mass was
                at 7 a.m., and the parish was cared for from Shirva. Families from N.S. De Saude and from N.S.
                Remedies, Kirem soon asked to join, and on 12 December 1900 the boundary with Kirem was settled.
              </p>
              <h2 className="pt-4 font-serif text-4xl font-semibold text-ink">The church on the hill</h2>
              <p>
                The present church, completed in 1933 under Fr. Denis R. Lewis, stands on a small hillock with its
                tall art-deco façade. A careful restoration led by Fr. Edwin D&rsquo;Souza in 2019 renewed the façade,
                pillars and belfry while preserving the character that generations of parishioners have prayed in.
              </p>
              <p>
                Today the parish numbers about 2,156 Catholics in 581 families across 21 wards. Its newsletter is
                ‘San Zuzechi Betkati’, and among its sons is the late Bishop Baptist Mudartha, Bishop of Allahabad.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="grid content-start gap-4">
              {[
                { src: "/carousel/altar.jpg", alt: "The altar of St. Joseph" },
                { src: "/carousel/nave.jpg", alt: "The nave" },
                { src: "/carousel/sunday-mass.jpg", alt: "Sunday Mass" },
              ].map((img) => (
                <figure key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </figure>
              ))}
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="timeline-heading" className="bg-ink px-6 py-20 md:py-28">
          <div className="mx-auto max-w-4xl">
            <h2 id="timeline-heading" className="font-serif text-4xl font-semibold text-cream md:text-5xl">
              Through the years
            </h2>
            <ol className="mt-12">
              {PARISH_TIMELINE.map((item, i) => (
                <Reveal key={item.year} delay={(i % 4) * 0.05}>
                  <li className="grid grid-cols-[92px_20px_1fr] gap-x-3 sm:grid-cols-[170px_28px_1fr] sm:gap-x-6">
                    <p className="pt-0.5 text-right font-serif text-lg font-semibold leading-tight text-primary sm:text-2xl">
                      {item.year}
                    </p>
                    <div className="relative flex justify-center" aria-hidden>
                      <span
                        className={`absolute top-2 w-px bg-primary/30 ${i === PARISH_TIMELINE.length - 1 ? "h-0" : "bottom-0"}`}
                      />
                      <span className="relative mt-1.5 h-4 w-4 rounded-full border-4 border-ink bg-primary" />
                    </div>
                    <div className="pb-12">
                      <h3 className="font-serif text-2xl font-semibold leading-tight text-white">{item.title}</h3>
                      <p className="mt-2 hyphens-auto text-justify leading-relaxed text-white/70">{item.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section id="priests" className="scroll-mt-10 bg-[#F3ECE0] px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-4xl font-semibold text-ink md:text-5xl">Parish priests</h2>
            <p className="mt-3 max-w-2xl text-lg text-textcolor/85">
              The shepherds who have served St. Joseph&rsquo;s since 1894.
            </p>
            <div className="mt-10">
              <PriestGrid priests={parish} />
            </div>

            <h2 className="mt-20 font-serif text-4xl font-semibold text-ink md:text-5xl">Assistant parish priests</h2>
            <div className="mt-10">
              <PriestGrid priests={assistants} />
            </div>
          </div>
        </section>

        <section className="bg-cream px-6 py-16">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 rounded-3xl bg-ink p-8 md:p-10">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-cream">St. Anthony&rsquo;s Shrine, Pakala</h2>
              <p className="mt-2 text-cream/70">The story of the miraculous statue and the shrine that grew around it.</p>
            </div>
            <Link
              href="/shrine"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-ink transition hover:bg-white"
            >
              Visit the shrine page
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
