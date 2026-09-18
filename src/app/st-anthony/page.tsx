import Image from "next/image";
import { Clock3, MapPin } from "lucide-react";

export default function StAnthonyChapel() {
  return (
    <main className="bg-[#17110c] font-sans text-white">
      <header className="relative flex min-h-[72vh] items-end overflow-hidden px-5 pb-14 pt-28 sm:px-8 sm:pb-20 lg:px-12">
        <Image
          src="/bg/st-anthony-facade.jpeg"
          alt="St. Anthony Chapel, Pakala"
          fill
          priority
          sizes="100vw"
          quality={82}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17110c] via-black/30 to-black/45" />
        <div className="relative mx-auto w-full max-w-6xl">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            St. Anthony Chapel
          </h1>
          <p className="mt-4 text-lg text-white/70">Pakala, Manjarpalke</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 lg:px-12">
        <section className="grid gap-10 border-b border-white/15 py-16 md:grid-cols-[0.7fr_1.3fr] md:gap-20 md:py-24">
          <div className="relative min-h-[32rem] overflow-hidden rounded-2xl bg-black/20">
            <Image
              src="/bg/st-anthony-statue.png"
              alt="The miraculous statue of St. Anthony"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain object-center p-4"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              The miraculous statue
            </h2>
            <div className="mt-6 space-y-5 leading-8 text-white/65">
              <p>
                Long ago, before buses and roads, fisherwomen walked from
                village to village, trading their catch for rice, vegetables and
                firewood. One evening, resting at the Pakala home of Francis
                D&apos;Silva, they found their bundle of firewood too heavy to
                lift. When they emptied it, they found inside a small wooden
                statue of St. Anthony. They left it behind and went home.
              </p>
              <p>
                The D&apos;Silva family kept the statue with great reverence,
                and devotion grew from one generation to the next. Favours were
                received by Christians and by neighbours of other faiths alike.
                It is told that a bullock cart driven carelessly across the
                entrance would not move at all until those on it asked St.
                Anthony&apos;s pardon and offered oil for his lamp. After that,
                people of every faith came to pray.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-white/15 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-24">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              A chapel for everyone
            </h2>
            <p className="mt-6 leading-8 text-white/65">
              Around 1970 the people of Pakala, with the parish priest Fr. N. J.
              Pereira, resolved to give St. Anthony a public place of prayer. A
              small chapel was built, and on 13 July 1974 it was blessed and
              opened. Today devotees come from morning to evening to pray and
              light candles, and travellers stop on the highway to bow their
              heads.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/bg/st-anthony-altar.webp"
              alt="Altar inside St. Anthony Chapel"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="grid gap-10 border-b border-white/15 py-16 md:grid-cols-[0.7fr_1.3fr] md:gap-20 md:py-24">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Who was St. Anthony?
          </h2>
          <p className="leading-8 text-white/65">
            Born in Lisbon in 1195 and baptised Ferdinand, he gave up his
            family&apos;s wealth to become a Franciscan, taking the name
            Anthony. A gifted preacher, he died at Padua on 13 June 1231 and was
            declared a saint within a year. He is loved as the patron of lost
            things and the saint of miracles.
          </p>
        </section>

        <section className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          <Info
            icon={<MapPin size={20} />}
            title="Where"
            value="Pakala, Manjarpalke"
            detail="About 2 km from the church, towards Karkala, on the road from Padubidri to Karkala."
          >
            <a
              href="https://www.google.com/maps/search/?api=1&query=St+Anthony+Chapel+Pakala+Manjarpalke"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block font-medium text-[#f0c878] underline underline-offset-4"
            >
              Get directions
            </a>
          </Info>
          <Info
            icon={<Clock3 size={20} />}
            title="Services"
            value="Tuesdays at 4:00 PM"
            detail="Every Tuesday."
          />
          <Info
            icon={<Clock3 size={20} />}
            title="Annual feast"
            value="13 June"
            detail="The feast of St. Anthony"
          />
        </section>
        <p className="mx-auto max-w-3xl py-16 text-center text-lg leading-8 text-white/65">
          Known to many of every faith as Pakala Dever, the miraculous statue of
          St. Anthony draws devotees here every day.
        </p>
      </div>
    </main>
  );
}

function Info({
  icon,
  title,
  value,
  detail,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-[#211811] p-7">
      <div className="text-[#f0c878]">{icon}</div>
      <h2 className="mt-5 text-sm text-white/50">{title}</h2>
      <p className="mt-2 text-lg font-medium">{value}</p>
      <p className="mt-3 text-sm leading-6 text-white/55">{detail}</p>
      {children}
    </div>
  );
}
