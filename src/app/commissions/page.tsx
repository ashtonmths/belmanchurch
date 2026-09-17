import { type Metadata } from "next";
import Footer from "~/components/Footer";
import InfoGrid from "~/components/InfoGrid";
import PageHero from "~/components/PageHero";
import { getContent } from "~/server/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commissions",
  description:
    "The pastoral commissions of St. Joseph Church, Belman: Bible, liturgy, catechetics, family, youth, education, health, justice and peace, and more.",
  alternates: { canonical: "/commissions" },
};

export default async function CommissionsPage() {
  const items = await getContent("commissions");
  return (
    <>
      <PageHero
        eyebrow="Parish ministries"
        title="Commissions"
        description="Parishioners who volunteer to carry the work of the parish into every part of daily life."
        image="/carousel/altar.jpg"
      />
      <main className="bg-cream px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <InfoGrid items={items} konkani />
        </div>
      </main>
      <Footer />
    </>
  );
}
