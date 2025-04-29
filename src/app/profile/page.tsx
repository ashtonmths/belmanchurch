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
      <div className="min-h-screen w-full bg-[url('/bg/home.jpg')] bg-cover bg-center">
        <div className="w-full bg-black/50 backdrop-blur-sm">
          <div className="flex w-full flex-col items-center justify-center pt-[12rem] pb-[4rem]">
            <div className="w-[90%] max-w-4xl text-center">
              <ProfileCard />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
