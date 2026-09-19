import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import TransitionWrapper from "~/components/Loader";
import NavbarSelector from "~/components/navbars/NavbarSelector";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "~/components/ScrollToTop";
import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL("https://belmanchurch.in"),
  applicationName: "St. Joseph Church, Belman",
  title: {
    default: "St. Joseph Church, Belman",
    template: "%s | St. Joseph Church, Belman",
  },
  description:
    "Official website of St. Joseph Church, Belman. Find Mass timings, parish events, church history, Bethkati issues, gallery albums and contact information.",
  keywords: [
    "St. Joseph Church Belman",
    "Belman Church",
    "Catholic church Belman",
    "Mass timings Belman",
    "Udupi Diocese",
    "St. Anthony Chapel Pakala",
  ],
  authors: [{ name: "St. Joseph Church, Belman" }],
  creator: "St. Joseph Church, Belman",
  publisher: "St. Joseph Church, Belman",
  category: "religion",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "St. Joseph Church, Belman",
    title: "St. Joseph Church, Belman",
    description:
      "Mass timings, parish events, church history, Bethkati issues and gallery albums from St. Joseph Church, Belman.",
    images: [
      {
        url: "/screenshots/hero.png",
        width: 1440,
        height: 1000,
        alt: "Inside St. Joseph Church, Belman",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "St. Joseph Church, Belman",
    description:
      "Mass timings, parish events, church history and gallery albums from Belman parish.",
    images: ["/screenshots/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: [{ rel: "icon", url: "/favicon.webp" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Church",
        "@id": "https://belmanchurch.in/#church",
        name: "St. Joseph Church, Belman",
        url: "https://belmanchurch.in",
        logo: "https://belmanchurch.in/Logo.png",
        image: "https://belmanchurch.in/screenshots/hero.png",
        email: env.SMTP_USER,
        telephone: "+91 91410 31604",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Belman",
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://belmanchurch.in/#website",
        url: "https://belmanchurch.in",
        name: "St. Joseph Church, Belman",
        description: "Official parish website of St. Joseph Church, Belman.",
        publisher: { "@id": "https://belmanchurch.in/#church" },
        inLanguage: "en-IN",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Our Parish",
        url: "https://belmanchurch.in/about",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Parish Events",
        url: "https://belmanchurch.in/events",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Gallery",
        url: "https://belmanchurch.in/gallery",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Bethkati",
        url: "https://belmanchurch.in/bethkati",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Contact Us",
        url: "https://belmanchurch.in/contact",
      },
    ],
  };

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#17110c] font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Analytics />
        <SessionProvider>
          <TransitionWrapper>
            <TRPCReactProvider>
              <NavbarSelector /> {/* Dynamically renders correct navbar */}
              {children}
              <ScrollToTop />
            </TRPCReactProvider>
          </TransitionWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
