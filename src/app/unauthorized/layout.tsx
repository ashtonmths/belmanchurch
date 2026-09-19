import { pageMetadata } from "~/lib/metadata";

export const metadata = pageMetadata({
  title: "Access restricted",
  description: "This page is restricted to authorised parish users.",
  path: "/unauthorized",
  noIndex: true,
});

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
