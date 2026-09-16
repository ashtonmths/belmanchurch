import { type Metadata } from "next";

// The page is a client component, so its metadata lives in this segment layout.
export const metadata: Metadata = {
  title: "About the Parish",
  description:
    "The history of St. Joseph Church, Belman, established as a parish in 1894 and today home to over 2,000 Catholics across 581 families in 21 wards.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About the Parish", url: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
