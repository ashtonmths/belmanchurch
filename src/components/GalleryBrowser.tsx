/* eslint-disable @next/next/no-img-element */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Link2, Share2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageShell from "~/components/PageShell";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

export default function GalleryBrowser({
  initialAlbumId = null,
}: {
  initialAlbumId?: string | null;
}) {
  const [albumId, setAlbumId] = useState(initialAlbumId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: folders, isLoading, error } = api.gallery.getFolders.useQuery();
  const { data: images, isFetching } = api.gallery.getImagesByID.useQuery(
    { id: albumId ?? "" },
    { enabled: !!albumId },
  );
  const activeFolder = folders?.find((folder) => folder.id === albumId);

  useEffect(() => {
    const syncFromUrl = () =>
      setAlbumId(location.pathname.split("/")[2] ?? null);
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    document.body.style.overflow = albumId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [albumId]);

  const openAlbum = (id: string) => {
    window.history.pushState({}, "", `/gallery/${id}`);
    setAlbumId(id);
  };
  const closeAlbum = () => {
    window.history.pushState({}, "", "/gallery");
    setSelectedImage(null);
    setAlbumId(null);
  };

  return (
    <PageShell
      title="Gallery"
      description="Moments of faith, fellowship and celebration from our community."
    >
      {isLoading ? (
        <p className="text-white/65">Loading albums…</p>
      ) : error ? (
        <p className="rounded-2xl border border-red-300/20 bg-red-950/30 p-5 text-red-100">
          {error.message}
        </p>
      ) : folders?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {folders.map((folder) => (
            <article
              key={folder.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] transition hover:border-[#f0c878]/45"
            >
              <button
                type="button"
                onClick={() => openAlbum(folder.id)}
                className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c878]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={folder.previewImage ?? "/favicon.webp"}
                    alt={folder.eventName}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-5 pb-3 pt-5">
                  <h2 className="font-medium text-white">{folder.eventName}</h2>
                  <p className="mt-2 text-sm text-white/50">
                    {new Date(folder.eventDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </button>
              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/gallery/${folder.id}`;
                    void navigator.clipboard.writeText(url);
                    toast.success("Album link copied");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-white/65 transition hover:border-[#f0c878]/50 hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878]"
                  aria-label={`Copy link to ${folder.eventName}`}
                >
                  <Share2 size={14} />
                  Share album
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-white/60">No albums found.</p>
      )}

      <AnimatePresence>
        {albumId && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAlbum}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={activeFolder?.eventName ?? "Gallery album"}
              className="ml-auto flex h-full w-full max-w-5xl flex-col bg-[#17110c] shadow-2xl sm:w-[92%]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
                <div>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">
                    {activeFolder?.eventName ?? "Album"}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    {images?.length ?? 0} photographs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAlbum}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-4 sm:p-7">
                {isFetching ? (
                  <p className="py-12 text-center text-white/55">
                    Loading photographs…
                  </p>
                ) : images?.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={image.id}
                        onClick={() => setSelectedImage(image.url)}
                        className="relative aspect-square overflow-hidden rounded-xl bg-white/5"
                      >
                        <Image
                          src={image.url}
                          alt={`${activeFolder?.eventName ?? "Album"} photograph ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-white/55">
                    No photographs in this album.
                  </p>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative flex max-h-full max-w-6xl flex-col items-center"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Selected gallery photograph"
                className="max-h-[80vh] max-w-full object-contain"
              />
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(selectedImage);
                    toast.success("Image link copied");
                  }}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
                >
                  <Link2 size={16} />
                  Copy link
                </button>
                <a
                  href={selectedImage}
                  download
                  className="flex items-center gap-2 rounded-full bg-[#f0c878] px-4 py-2 text-sm font-medium text-[#211811]"
                >
                  <Download size={16} />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-right" autoClose={2500} />
    </PageShell>
  );
}
