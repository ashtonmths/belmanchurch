import { Clock, MapPin } from "lucide-react";
import { type Metadata } from "next";
import Image from "next/image";
import Footer from "~/components/Footer";
import PageHero from "~/components/PageHero";
import PhotoGrid from "~/components/PhotoGrid";
import Reveal from "~/components/home/Reveal";
import { MAPS_URL, SHRINE } from "~/lib/parish";
import { getContent } from "~/server/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "St. Anthony's Shrine, Pakala",
  description:
    "The miraculous statue of St. Anthony at Pakala, Manjarapalke, a shrine of Belman parish visited daily by devotees of every faith. Tuesday services and the feast on 13 June.",
  alternates: { canonical: "/shrine" },
};

const PHOTOS = [
  { src: "/shrine/shrine-statue.jpg", alt: "The miraculous statue of St. Anthony" },
  { src: "/shrine/relic.jpg", alt: "The relic of St. Anthony" },
  { src: "/shrine/candles.jpg", alt: "Devotees lighting candles" },
  { src: "/shrine/devotion.jpg", alt: "Prayer at the shrine" },
  { src: "/shrine/feast-mass.jpg", alt: "Feast Mass" },
  { src: "/shrine/feast-crowd.jpg", alt: "The faithful at the feast" },
  { src: "/shrine/procession.jpg", alt: "The feast procession" },
  { src: "/shrine/old-chapel.jpg", alt: "The early shrine building" },
];

export default async function ShrinePage() {
  const services = await getContent("otherServices");
  const shrine = services.find((s) => s.label.startsWith("St. Anthony"));

  return (
    <>
      <PageHero
        eyebrow="A shrine of Belman parish"
        title="St. Anthony's Shrine, Pakala"
        description="Known to many of every faith as ‘Pakala Dever’, the miraculous statue of St. Anthony draws devotees here every day."
        image="/shrine/feast-crowd.jpg"
        imageAlt="Devotees at the feast of St. Anthony"
      />

      <main>
        <section className="bg-cream px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.3fr]">
            <Reveal className="relative mx-auto w-full max-w-sm">
              <div className="relative aspect-[1/2] overflow-hidden rounded-[2rem] shadow-2xl shadow-accent/30">
                <Image
                  src="/shrine/statue.jpg"
                  alt="The wooden statue of St. Anthony holding the Child Jesus"
                  fill
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={0.1} className="hyphens-auto space-y-6 text-justify text-lg leading-relaxed text-textcolor/90">
              <h2 className="font-serif text-4xl font-semibold text-ink">The miraculous statue</h2>
              <p>
                Long ago, before buses and roads, fisherwomen walked from village to village, trading their catch for
                rice, vegetables and firewood. One evening, resting at the Pakala home of Francis D&rsquo;Silva, they found
                their bundle of firewood too heavy to lift. When they emptied it, they found inside a small wooden
                statue of St. Anthony. They left it behind and went home.
              </p>
              <p>
                The D&rsquo;Silva family kept the statue with great reverence, and devotion grew from one generation to the
                next. Favours were received by Christians and by neighbours of other faiths alike. It is told that a
                bullock cart driven carelessly across the entrance would not move at all until those on it asked St.
                Anthony&rsquo;s pardon and offered oil for his lamp. After that, people of every faith came to pray.
              </p>
              <h2 className="pt-4 font-serif text-4xl font-semibold text-ink">A shrine for everyone</h2>
              <p>
                Around 1970 the people of Pakala, with the parish priest Fr. N. J. Pereira, resolved to give St.
                Anthony a public place of prayer. A small shrine was built, and on 13 July 1974 it was blessed and
                opened. Today devotees come from morning to evening to pray and light candles, and travellers stop on
                the highway to bow their heads.
              </p>
              <h2 className="pt-4 font-serif text-4xl font-semibold text-ink">Who was St. Anthony?</h2>
              <p>
                Born in Lisbon in 1195 and baptised Ferdinand, he gave up his family&rsquo;s wealth to become a Franciscan,
                taking the name Anthony. A gifted preacher, he died at Padua on 13 June 1231 and was declared a saint
                within a year. He is loved as the patron of lost things and the saint of miracles.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-ink px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-cream">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <MapPin size={14} aria-hidden /> Where
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold">{SHRINE.place}</p>
              <p className="mt-1 text-cream/70">{SHRINE.distance}, on the road from Padubidri to Karkala.</p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Get directions →
              </a>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-cream">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Clock size={14} aria-hidden /> Services
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold">
                Tuesdays at {shrine?.times.join(", ") ?? "4:00 PM"}
              </p>
              {shrine?.note && <p className="mt-1 text-cream/70">{shrine.note}</p>}
            </div>
            <div className="rounded-3xl bg-primary p-7 text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Annual feast</p>
              <p className="mt-3 font-serif text-4xl font-semibold">{SHRINE.feast}</p>
              <p className="mt-1 text-ink/70">The feast of St. Anthony</p>
            </div>
          </div>
        </section>

        <section className="bg-cream px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-serif text-4xl font-semibold text-ink">Photos</h2>
            <PhotoGrid photos={PHOTOS} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
