import { type Metadata } from "next";

// Private area: keep it out of search results even if a link to it leaks.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
