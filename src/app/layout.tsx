import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import TransitionWrapper from "~/components/Loader";
import NavbarSelector from "~/components/navbars/NavbarSelector";
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "Belman Church",
  description: "Main Website of St. Joseph Church, Belman",
  icons: [{ rel: "icon", url: "/favicon.webp" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex max-h-screen flex-col">
        <Analytics />
        <SessionProvider>
          <TransitionWrapper>
            <TRPCReactProvider>
              <NavbarSelector /> {/* Dynamically renders correct navbar */}
              {children}
            </TRPCReactProvider>
          </TransitionWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
