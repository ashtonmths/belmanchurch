import { type Metadata } from "next";

// The page is a client component, so its metadata lives in this segment layout.
export const metadata: Metadata = {
  title: "Bethkati Newsletter",
  description:
    "Read monthly issues of Bethkati, the parish newsletter of St. Joseph Church, Belman.",
  alternates: { canonical: "/bethkati" },
  openGraph: { title: "Bethkati Newsletter", url: "/bethkati" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
