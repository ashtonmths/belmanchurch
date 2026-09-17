/* eslint-disable @next/next/no-img-element */
"use client";
import { api } from "~/trpc/react";
import Image from "next/image";
import { motion } from "framer-motion";
import "react-medium-image-zoom/dist/styles.css";
import { useRouter } from "next/navigation";
import PageShell from "~/components/PageShell";

export default function Gallery() {
  const { data: folders, isLoading, error } = api.gallery.getFolders.useQuery();
  const router = useRouter();

  return (
    <PageShell
      eyebrow="Parish life"
      title="Gallery"
      description="Moments of faith, fellowship and celebration from our community."
    >
      {isLoading ? (
        <p className="text-white/65">Loading albums…</p>
      ) : error ? (
        <p className="rounded-2xl border border-red-300/20 bg-red-950/30 p-5 text-red-100">
          {error.message}
        </p>
      ) : folders && folders.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {folders.map((folder) => (
            <motion.div
              key={folder.id}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-xl backdrop-blur-md"
              onClick={() => router.push(`/gallery/${folder.id}`)}
              whileHover={{ y: -4 }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={folder.previewImage ?? "/favicon.webp"}
                  alt={folder.eventName}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-white">
                  {folder.eventName}
                </h2>
                <p className="mt-2 text-sm text-white/55">
                  {new Date(folder.eventDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center text-white/65">
          No albums found.
        </p>
      )}
    </PageShell>
  );
}
