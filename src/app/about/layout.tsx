import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Our parish history",
  description:
    "Read the history of St. Joseph Church, Belman, from its roots in Shirva to the present parish community.",
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
