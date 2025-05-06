/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect } from "react";
import { api } from "~/trpc/react";
import ProtectedRoute from "~/components/ProtectRoute";
import Image from "next/image";
import { motion } from "framer-motion";
import "react-medium-image-zoom/dist/styles.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Gallery() {
  const { data: folders, isLoading, error } = api.gallery.getFolders.useQuery();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);


  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

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
          <div className="flex h-[81%] min-h-0 w-[90%] flex-col items-center gap-6 overflow-y-auto overflow-x-hidden p-6 text-center md:flex-row md:flex-wrap md:justify-center">
            {folders && folders.length > 0 ? (
              folders.map((folder) => (
                <motion.div
                  key={folder.id}
                  className="relative flex h-80 w-64 flex-none cursor-pointer flex-col overflow-hidden rounded-lg bg-primary shadow-lg"
                  onClick={() => router.push(`/gallery/${folder.id}`)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative flex h-[70%] w-full items-center justify-center overflow-hidden bg-primary p-4">
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      <Image
                        src={folder.previewImage ?? "/favicon.webp"}
                        alt={folder.eventName}
                        fill
                        className="scale-110 object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex h-[20%] w-full items-center justify-center bg-primary p-2 font-cursive text-4xl font-bold text-textcolor">
                    {folder.eventName}
                  </div>
                  <div className="-mt-2 mb-2 flex h-[10%] w-full items-center justify-center bg-primary p-2 text-xl font-bold text-textcolor">
                    {folder.eventDate.toLocaleDateString('en-GB')}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-4xl font-bold text-primary">
                No Folders Found.
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
