import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "St. Anthony Chapel, Pakala",
  description:
    "Learn about the miraculous statue, history, services and annual feast of St. Anthony Chapel at Pakala, Manjarapalke.",
  path: "/st-anthony",
});

export default function ChapelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
