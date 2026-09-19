import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Parish events",
  description: "View upcoming and recent events at St. Joseph Church, Belman.",
  path: "/events",
});

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
