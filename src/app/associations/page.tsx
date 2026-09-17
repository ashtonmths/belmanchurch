import { type Metadata } from "next";
import Footer from "~/components/Footer";
import InfoGrid from "~/components/InfoGrid";
import PageHero from "~/components/PageHero";
import { getContent } from "~/server/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Associations",
  description:
    "Parish associations at St. Joseph Church, Belman: ICYM, YCS, altar servers, Marian Sodality, Catholic Sabha, St. Vincent de Paul Society, Stree Sangathan and more.",
  alternates: { canonical: "/associations" },
};

export default async function AssociationsPage() {
  const items = await getContent("associations");
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Parish associations"
        description="Groups for every age and calling, where parishioners pray, serve and grow together."
        image="/carousel/sunday-mass.jpg"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <InfoGrid items={items} />
        </div>
      </main>
      <Footer />
    </>
  );
}
