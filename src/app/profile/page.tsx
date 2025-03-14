"use client";
import ProfileCard from "~/components/ProfileCard";
import ProtectedRoute from "~/components/ProtectRoute";

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
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
        <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center">
            <ProfileCard />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
