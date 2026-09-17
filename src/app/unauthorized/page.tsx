"use client";
import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";
import Button from "~/components/Button";
import { usePathname, useRouter } from "next/navigation";
import PageShell from "~/components/PageShell";

export default function Unauthorized() {
  const pathname = usePathname();
  const router = useRouter();

  const needsAuth =
    pathname.startsWith("/admin") || pathname.startsWith("/donate");

  return (
    <PageShell contentClassName="grid min-h-[65vh] place-items-center">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.07] p-8 text-center backdrop-blur-md sm:p-12">
        {/* Locked Icon */}
        <Lock className="mx-auto h-16 w-16 text-[#f0c878]" />

        {/* Unauthorized Text */}
        <h1 className="mb-4 mt-6 text-3xl font-bold text-white">
          Access restricted
        </h1>

        {/* Login Prompt if needed */}
        {needsAuth && (
          <p className="mb-8 text-white/60">
            Sign in with an authorised account to continue.
          </p>
        )}

        {/* Button: Home or Login */}
        {needsAuth ? (
          <Button onClick={() => router.push("/")}>Home</Button>
        ) : (
          <Button onClick={() => signIn("google")}>Login</Button>
        )}
      </div>
    </PageShell>
  );
}
