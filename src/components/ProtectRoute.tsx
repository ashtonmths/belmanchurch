import { useRole } from "~/hooks/useRole";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

type UserRole = "DEVELOPER" | "ADMIN" | "PHOTOGRAPHER" | "PARISHONER" | "USER";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { status } = useSession(); // Handles auth state
  const role = useRole(); // Custom hook (may return undefined initially)
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (role && !allowedRoles.includes(role)) {
      router.push("/unauthorized");
    }
  }, [status, role, allowedRoles, router]);

  if (status === "loading" || !role) {
    const admin = pathname.startsWith("/admin");
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#17110c] text-white">
        <div
          className={`absolute inset-0 bg-cover bg-center ${admin ? "bg-[url('/bg/admin.jpg')]" : "bg-[url('/bg/home.jpg')]"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#17110c]/85 to-[#17110c]" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pt-32">
          <div className="h-10 w-52 animate-pulse rounded-xl bg-white/10" />
          <div className="mt-8 min-h-[65vh] animate-pulse rounded-3xl border border-white/10 bg-[#211811]/90" />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
