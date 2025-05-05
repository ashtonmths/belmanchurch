"use client";
import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";
import Button from "~/components/Button";
import { usePathname, useRouter } from "next/navigation";

export default function Unauthorized() {
  const pathname = usePathname();
  const router = useRouter();

  const needsAuth = pathname.startsWith("/admin") || pathname.startsWith("/donate");

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center">
          {/* Locked Icon */}
          <Lock className="h-28 w-28 text-primary" />

          {/* Unauthorized Text */}
          <h1 className="mt-4 text-3xl font-bold text-primary mb-10">Unauthorized</h1>

          {/* Login Prompt if needed */}
          {needsAuth && (
            <h2 className="mb-24 mt-2 text-3xl font-bold text-primary">
              Login to Continue
            </h2>
          )}

          {/* Button: Home or Login */}
          {needsAuth ? (
            <Button onClick={() => router.push("/")}>Home</Button>
          ) : (
            <Button onClick={() => signIn("google")}>Login</Button>
          )}
        </div>
      </div>
    </div>
  );
}
