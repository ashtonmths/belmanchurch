import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Contact the parish office of St. Joseph Church, Belman by message, email, phone or in person.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
