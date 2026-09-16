import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { type Metadata } from "next";
import ContactForm from "~/components/ContactForm";
import Footer from "~/components/Footer";
import PageHero from "~/components/PageHero";
import { MAPS_URL, PARISH } from "~/lib/parish";
import { getContent } from "~/server/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${PARISH.name}: address, phone, email, parish office hours and a message form.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const officeHours = await getContent("officeHours");
  const { address } = PARISH;

  return (
    <>
      <PageHero
        eyebrow="We'd love to hear from you"
        title="Contact the parish"
        description="Questions about Mass intentions, sacraments, certificates or visiting? Send us a message, call, or drop by the parish office."
        image="/carousel/altar.jpg"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[380px_1fr]">
          <aside className="relative isolate overflow-hidden rounded-3xl bg-ink p-8 text-cream md:p-10">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-2xl"
            />
            <h2 className="font-serif text-3xl font-semibold">Parish office</h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-1 shrink-0 text-primary" size={20} aria-hidden />
                <address className="not-italic leading-relaxed text-cream/85">
                  {PARISH.name}
                  <br />
                  {address.street}
                  <br />
                  {address.locality}, {address.district}
                  <br />
                  {address.region} {address.postalCode}
                </address>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 shrink-0 text-primary" size={20} aria-hidden />
                <a href={`tel:${PARISH.phone}`} className="font-semibold hover:text-primary">
                  {PARISH.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-1 shrink-0 text-primary" size={20} aria-hidden />
                <a href={`mailto:${PARISH.email}`} className="break-all font-semibold hover:text-primary">
                  {PARISH.email}
                </a>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-1 shrink-0 text-primary" size={20} aria-hidden />
                <div className="text-cream/85">
                  {officeHours.times.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <p className="mt-1 text-sm text-cream/60">Monday to Friday · {officeHours.note}</p>
                </div>
              </li>
            </ul>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-ink transition hover:bg-white"
            >
              <Navigation size={16} aria-hidden /> Get directions
            </a>
          </aside>

          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
