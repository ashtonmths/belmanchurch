import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "My parish profile",
  description: "Private parish member profile.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
