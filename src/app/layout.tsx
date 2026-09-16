import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import NavbarSelector from "~/components/navbars/NavbarSelector";
import { Analytics } from "@vercel/analytics/react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { PARISH, SITE_URL } from "~/lib/parish";

// Loaded with next/font so they are self-hosted and never block rendering.
// Tailwind maps them to `font-serif` (headings) and `font-sans` (body).
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const description = `Mass timings, events, gallery and parish news from ${PARISH.name}, ${PARISH.address.locality}, ${PARISH.address.region}. Established ${PARISH.founded}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PARISH.name,
    template: `%s | ${PARISH.shortName}`,
  },
  description,
  applicationName: PARISH.shortName,
  keywords: [
    "St Joseph Church Belman",
    "Belman Church",
    "Belman parish",
    "mass timings Belman",
    "Catholic church Belman",
    "Bethkati",
  ],
  openGraph: {
    type: "website",
    siteName: PARISH.shortName,
    title: PARISH.name,
    description,
    url: SITE_URL,
    locale: "en_IN",
    images: [
      {
        url: "/screenshots/hero.png",
        width: 1200,
        height: 630,
        alt: `${PARISH.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PARISH.name,
    description,
    images: ["/screenshots/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: [{ rel: "icon", url: "/favicon.webp" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col bg-ink font-sans antialiased">
        <Analytics />
        <SessionProvider>
          <TRPCReactProvider>
            <NavbarSelector /> {/* Dynamically renders correct navbar */}
            {children}
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
