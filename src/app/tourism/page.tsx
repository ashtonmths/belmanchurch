import { type Metadata } from "next";
import Footer from "~/components/Footer";
import InfoGrid from "~/components/InfoGrid";
import PageHero from "~/components/PageHero";
import { getContent } from "~/server/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Places to Visit",
  description:
    "Places to visit around Belman: St. Anthony's Shrine at Pakala, Arbi Falls, Karkala, Attur, Nandalike, Padubidri, Kaup and Malpe beaches, St. Mary's Islands and Udupi.",
  alternates: { canonical: "/tourism" },
};

export default async function TourismPage() {
  const items = await getContent("tourism");
  return (
    <>
      <PageHero
        eyebrow="In and around Belman"
        title="Places to visit"
        description="Shrines, waterfalls, temple towns and beaches, all within easy reach of the parish."
        image="/carousel/facade.jpg"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <InfoGrid items={items} placeholder />
        </div>
      </main>
      <Footer />
    </>
  );
}
