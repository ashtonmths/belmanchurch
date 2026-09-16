import { type Metadata } from "next";

// The page is a client component, so its metadata lives in this segment layout.
export const metadata: Metadata = {
  title: "Parish Events",
  description:
    "Upcoming events, feasts and celebrations at St. Joseph Church, Belman, with dates, times and venues.",
  alternates: { canonical: "/events" },
  openGraph: { title: "Parish Events", url: "/events" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
