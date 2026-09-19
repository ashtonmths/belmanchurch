import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Online donations",
  description:
    "Online donation information for St. Joseph Church, Belman and St. Anthony Chapel, Pakala.",
  path: "/donate",
});

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
