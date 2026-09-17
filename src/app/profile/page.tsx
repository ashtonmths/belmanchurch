"use client";
import ProfileCard from "~/components/ProfileCard";
import ProtectedRoute from "~/components/ProtectRoute";
import PageShell from "~/components/PageShell";

export default function Profile() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "USER",
        "PARISHONER",
        "PHOTOGRAPHER",
        "ADMIN",
        "DEVELOPER",
      ]}
    >
      <PageShell title="Profile" contentClassName="mx-auto max-w-4xl">
        <div className="text-center">
          <ProfileCard />
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
