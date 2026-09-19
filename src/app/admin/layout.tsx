import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Parish administration",
  description: "Private administration area for St. Joseph Church, Belman.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
