import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Parish gallery",
  description:
    "Browse and download photographs from parish celebrations and events at St. Joseph Church, Belman.",
  path: "/gallery",
});

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
