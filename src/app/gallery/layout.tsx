import { type Metadata } from "next";

// The page is a client component, so its metadata lives in this segment layout.
export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Photos from Masses, feasts and parish events at St. Joseph Church, Belman.",
  alternates: { canonical: "/gallery" },
  openGraph: { title: "Photo Gallery", url: "/gallery" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
