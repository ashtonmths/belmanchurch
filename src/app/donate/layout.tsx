import { type Metadata } from "next";

// The page is a client component, so its metadata lives in this segment layout.
export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support St. Joseph Church and St. Anthony Chapel, Belman, or offer a Thanksgiving Mass, with secure online donations.",
  alternates: { canonical: "/donate" },
  openGraph: { title: "Donate", url: "/donate" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
