import { type Metadata } from "next";
import Footer from "~/components/Footer";
import InfoGrid from "~/components/InfoGrid";
import PageHero from "~/components/PageHero";
import { getContent } from "~/server/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Institutions",
  description:
    "St. Joseph's Higher Primary School (1896), High School (1982), English Medium School (2012) and Don Bosio Convent (1966) in Belman.",
  alternates: { canonical: "/institutions" },
};

export default async function InstitutionsPage() {
  const items = await getContent("institutions");
  return (
    <>
      <PageHero
        eyebrow="Serving through education"
        title="Parish institutions"
        description="Schools that have taught the children of Belman since 1896, and the sisters who serve among them."
        image="/institutions/campus.jpg"
        imageAlt="The St. Joseph's school campus"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <InfoGrid items={items} grayscale />
        </div>
      </main>
      <Footer />
    </>
  );
}
