import { useRole } from "~/hooks/useRole";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (role && !allowedRoles.includes(role as UserRole)) {
      router.push("/unauthorized");
    }
  }, [status, role, allowedRoles, router]);

  if (status === "loading" || !role) return <p>Loading...</p>;

  return <>{children}</>;
}
