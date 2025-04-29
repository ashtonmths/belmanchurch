"use client";
import React, { useEffect } from "react";
import Timeline from "~/components/Timeline";
import PriestTimeline from "~/components/PriestTimeline";
import AssociationsSection from "~/components/AssociationsSection";
import StAnthonySection from "~/components/StAnthonySection";
import { ArrowUp } from "lucide-react";

const About = () => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  const checkScrollPosition = () => {
    if (window.pageYOffset > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollPosition);
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  // Updated Timeline data with more historical events
  const parishHistory = [
    {
      year: "16th Century",
      title: "Early Christianity",
      content:
        "Christianity set its foot in the district and grew to considerable strength in the 17th and 18th centuries. The Mathias family was one of the earliest Christian families in the region.",
    },
    {
      year: "1784",
      title: "Tippu's Captivity",
      content:
        "The Mathias family, along with other Christians, were taken captive by Tippu's soldiers. This was a challenging period for Christianity in the region.",
    },
    {
      year: "1789",
      title: "Return and Settlement",
      content:
        "After their release, the Mathias family returned to Belman and settled around Naniltar. They became one of the most prominent and wealthy families in the area.",
    },
    {
      year: "Pre-1886",
      title: "Early Parish Structure",
      content:
        "Belman was initially part of Shirva parish, which had two churches - N.S. De Saude (under Padroado regime with Bishop in Goa) and St. Francis Xaviers' (under Propaganda congregation of Rome). Most Belman families belonged to St. Francis Xaviers' Church.",
    },
    {
      year: "1886",
      title: "Episcopal Sanction",
      content:
        "On November 29, Bishop N.M. Pagani, S.J. of Mangalore granted permission for the erection of a chapel in Belman, recognizing the spiritual needs of Christians in the area.",
    },
    {
      year: "1887",
      title: "Chapel Construction Begins",
      content:
        "Construction of St. Joseph's chapel began on land belonging to the Brahmin family 'Madkamane'. The Mathias family financed the construction work.",
    },
    {
      year: "1894",
      title: "Parish Establishment",
      content:
        "On September 10, Bishop Pagani officially established Belman as a separate parish. Rev. Fr. N. Carneiro was appointed as the first parish priest. The chapel was blessed and opened with mud walls and a hay thatched roof.",
    },
    {
      year: "1894-1900",
      title: "Early Parish Life",
      content:
        "The chapel was administered from Shirva. Sunday mass was at 7:00 a.m., and the parish priest received Rs.2/- as traveling expenses. The church had no priest's house or belfry.",
    },
    {
      year: "1900",
      title: "Parish Growth",
      content:
        "On December 12, the territorial boundary between Kirem and Belman was officially settled. Many families from N.S. De Saude and N.S. Remedies, Kirem transferred to Belman parish.",
    },
    {
      year: "Early 1900s",
      title: "Community Formation",
      content:
        "The Christian community grew to include prominent families like the D'Mellos at Bibinal, Mudartha's at Balegundi, Aranha's at Bola and Cardoza's around Indar, alongside the established Mathias family.",
    },
    {
      year: "1933",
      title: "New Church Building",
      content:
        "A new church building was constructed, modeled after the Gloria Church in Byculla, Mumbai, by Fr. Denis R. Lewis. The church featured an impressive facade in art deco style and was elevated on a small hillock.",
    },
    {
      year: "2019",
      title: "Church Restoration",
      content:
        "Under Fr. Edwin D'Souza's leadership, the church underwent a major restoration project costing Rs. 1.5 crore. The project preserved the church's heritage while enhancing its beauty. Original architectural elements were carefully restored, including the facade, pillars, and belfry. The project received support from the Karnataka government and generous donations from parishioners.",
    },
    {
      year: "Present Day",
      title: "Modern Parish",
      content:
        "Today, Belman Parish has grown to include 2,156 Catholics across 581 families, divided into 21 wards. The parish publishes its own newsletter 'San Zuzechi Betkati' and has produced notable clergy including Bishop Baptist Mudartha (Bishop of Jhansi).",
    },
  ];

  // Priest data
  const parishPriests = [
    { name: "Rev.Fr. Nicholas Carneiro", period: "1894 - 1903" },
    { name: "Rev.Fr. Rosario P. Lewis", period: "1903 - 1906" },
    { name: "Rev.Fr. Emmanuel Vas", period: "1906 - 1910" },
    { name: "Rev.Fr. Peter R. D'Souza", period: "1910 - 1913" },
    { name: "Rev.Fr. Anthony A.E. Colaco", period: "1913 - 1914" },
    { name: "Rev.Fr. Denis R. Lewis", period: "1914 - 1934" },
    { name: "Rev.Fr. P.L. Botelho", period: "1934 - 1957" },
    { name: "Rev.Fr. Nicholas J. Pereira", period: "1957 - 1973" },
    { name: "Rev.Fr. Aloysius Rodrigues", period: "1973 - 1978" },
    { name: "Rev.Fr. Lawrence Gomes", period: "1978 - 1986" },
    { name: "Rev.Fr. John Fernandes", period: "1986 - 1994" },
    { name: "Rev.Fr. Thomas D'Souza", period: "1994 - 2001" },
    { name: "Rev.Fr. Lawrence Rodrigues", period: "2002 - 2009" },
    { name: "Rev.Fr. Lawrence B. D'Souza", period: "2009 - 2016" },
    { name: "Rev.Fr. Sunil Vaigus", period: "2016 - 2017" },
    { name: "Rev.Fr. Edwin D'souza", period: "2017 - Till Date" },
  ];

  const assistantPriests = [
    { name: "Fr. Sylvester D'Costa", period: "14.06.1993 to 19.06.1995" },
    { name: "Fr. Micheal Santhumayor", period: "21.05.1995 to May 1997" },
    { name: "Fr. Dolphy Monteiro", period: "" },
    { name: "Fr. Jerome D'Souza", period: "" },
    { name: "Fr. Lawrence Mascarenhas", period: "" },
    { name: "Rev. Fr. Pascal Menezes", period: "27.05.2002 to 22.05.2003" },
    {
      name: "Rev. Fr. Praveen Amrith Martis",
      period: "17.05.2003 to 17.05.2005",
    },
    { name: "Rev. Fr. Vijay Lobo", period: "16.05.2005 to 27.05.2007" },
    {
      name: "Rev. Fr. Rocky Ravi Fernandes",
      period: "10.05.2007 to 30.05.2009",
    },
    { name: "Rev. Fr. Edwin D'Souza", period: "2009 to 2010" },
    { name: "Rev. Fr. Melwyn Lobo", period: "2010 to 2011" },
    { name: "Rev. Fr. Ronald Pinto", period: "2011 to 2012" },
    { name: "Rev. Fr. John Baptist Moras", period: "2014 to 2016" },
    { name: "Rev. Fr. Joswin Praveen D'Souza", period: "2016 to 2017" },
    { name: "Rev. Fr. Melwyl Roy Lobo", period: "2017 to 2018" },
    { name: "Rev. Fr. Prakash Menezes OP", period: "2018 to 2019" },
    { name: "Rev.Fr. Ivan Martis", period: "2020 to present" },
  ];

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex h-[81%] min-h-0 w-[90%] flex-col items-center gap-6 overflow-y-auto overflow-x-hidden p-6 text-center md:flex-row md:flex-wrap md:justify-center">
          <div className="min-h-screen">
            {/* Hero Section */}
            <section className="px-4 py-12">
              <div className="container mx-auto max-w-6xl">
                <h1 className="mb-6 text-center text-4xl font-bold md:text-5xl text-primary">
                  About Belman Parish
                </h1>
                <div className="mx-auto max-w-3xl rounded-lg bg-primary p-6 backdrop-blur-sm text-textcolor font-semibold">
                  <p className="mb-4 text-lg">
                    Belman parish was established in 1894 with a current
                    Catholic population of around 2,156 individuals across 581
                    families. The parish is divided into 21 wards and publishes
                    &apos;San Zuzechi Betkati&apos; as its newsletter.
                  </p>
                  <p className="text-lg">
                    Located 48 km north of Mangalore on the Padubidri-Kudremukh
                    State Highway, this parish is surrounded by natural beauty
                    and rich history, serving as a spiritual home for
                    generations of believers.
                  </p>
                </div>
              </div>
            </section>

            {/* Location Section */}
            <section className="px-4 py-12 text-primary font-semibold">
              <div className="container mx-auto max-w-6xl">
                <div className="rounded-lg border-l-4 border-accent bg-primary p-6 md:p-10">
                  <h2 className="mb-4 text-3xl font-bold text-textcolor">
                    Location & Background
                  </h2>
                  <div className="grid gap-8 md:grid-cols-2 text-accent">
                    <div>
                      <h3 className="mb-3 text-xl font-semibold">Location</h3>
                      <p className="mb-4">
                        This church is situated at a distance of 48 kms north of
                        Mangalore, on Padubidri-Kudremukh State Highway and is
                        surrounded by Mukamar, Parapady, Pernal, Mundkur,
                        Kelmbet, Mudarangady and Palimar parishes.
                      </p>

                      <h3 className="mb-3 text-xl font-semibold">The Name</h3>
                      <p className="mb-4">
                        The word Belmannu came from &apos;bili mannu&apos;
                        in Kannada meaning white soil. Belman was once a part of
                        Shirva parish before becoming its own parish in 1894.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-xl font-semibold">
                        The Setting
                      </h3>
                      <p className="mb-4">
                        Belman is a village in coastal Karnataka in Udupi
                        District, between Padubidri and Karkala. It has its
                        natural scenic beauty with paddy fields, coconut
                        gardens, hills and valleys. Agriculture is the main
                        occupation of its people.
                      </p>

                      <p>
                        Since many years, Belmanites have been moving out of the
                        village to many parts of India, specially to Mumbai and
                        now to gulf countries. Christianity set its foot in our
                        District in the 16th century and grew to considerable
                        strength in the 17th and 18th centuries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Parish History Timeline */}
            <Timeline events={parishHistory} title="Parish History Timeline" />

            {/* Parish Priests Timeline */}
            <div className="py-10">
              <div className="container mx-auto max-w-6xl">
                <PriestTimeline
                  priests={parishPriests}
                  title="Parish Priests Through History"
                />
                <PriestTimeline
                  priests={assistantPriests}
                  title="Assistant Parish Priests"
                />
              </div>
            </div>

            {/* Associations Section */}
            <AssociationsSection />

            {/* St. Anthony Section */}
            <StAnthonySection />
            {/* Scroll to top button */}
            <button
              className={`fixed bottom-6 right-6 rounded-full bg-primary p-3 text-accent shadow-lg transition-opacity ${showScrollTop ? "opacity-100" : "pointer-events-none opacity-0"}`}
              onClick={scrollToTop}
            >
              <ArrowUp size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
