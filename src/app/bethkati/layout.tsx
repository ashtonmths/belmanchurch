import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Bethkati parish bulletin",
  description:
    "Read current and past issues of San Zuzechi Bethkati, the parish bulletin of St. Joseph Church, Belman.",
  path: "/bethkati",
});

export default function BethkatiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
