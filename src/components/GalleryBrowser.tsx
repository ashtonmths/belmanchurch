/* eslint-disable @next/next/no-img-element */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Heart, Link2, Share2, X } from "lucide-react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ThemedToast from "~/components/ThemedToast";
import PageShell from "~/components/PageShell";
import { api, type RouterOutputs } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

function cloudinaryUrl(url: string, transformation: string) {
  return url.includes("res.cloudinary.com") && url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/${transformation}/`)
    : url;
}

function downloadUrl(url: string) {
  return cloudinaryUrl(url, "fl_attachment");
}

export default function GalleryBrowser({
  initialAlbumId = null,
  initialFolders,
  initialImages,
}: {
  initialAlbumId?: string | null;
  initialFolders?: RouterOutputs["gallery"]["getFolders"];
  initialImages?: RouterOutputs["gallery"]["getImagesByID"];
}) {
  const [albumId, setAlbumId] = useState(initialAlbumId);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [likeState, setLikeState] = useState<
    Record<string, { liked: boolean; count: number }>
  >({});
  const { data: session } = useSession();
  const toggleLike = api.gallery.toggleLike.useMutation();
  const {
    data: folders,
    isLoading,
    error,
  } = api.gallery.getFolders.useQuery(undefined, {
    initialData: initialFolders,
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const { data: images, isFetching } = api.gallery.getImagesByID.useQuery(
    { id: albumId ?? "" },
    {
      enabled: !!albumId,
      initialData: albumId === initialAlbumId ? initialImages : undefined,
      staleTime: 5 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
  const activeFolder = folders?.find((folder) => folder.id === albumId);
  const selectedImage =
    selectedIndex === null ? null : (images?.[selectedIndex] ?? null);

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
    setSelectedIndex(null);
    setAlbumId(null);
  };

  const moveImage = (direction: -1 | 1) => {
    if (selectedIndex === null || !images?.length) return;
    setSelectedIndex(
      (selectedIndex + direction + images.length) % images.length,
    );
  };

  const signInToLike = () => {
    if (!selectedImage || !albumId) return;
    sessionStorage.setItem(
      "pending-gallery-like",
      JSON.stringify({ albumId, imageId: selectedImage.id }),
    );
    void signIn("google", {
      redirectTo: `${window.location.origin}/gallery/${albumId}`,
    });
  };

  const handleLike = () => {
    if (!selectedImage) return;
    if (!session) {
      toast.info(
        <div className="flex items-center gap-4">
          <span className="text-sm">Sign in to like this photograph.</span>
          <button
            type="button"
            onClick={signInToLike}
            className="shrink-0 rounded-full bg-[#f0c878] px-3 py-1.5 text-xs font-semibold text-[#211811]"
          >
            Sign in
          </button>
        </div>,
      );
      return;
    }
    const current = likeState[selectedImage.id] ?? {
      liked: selectedImage.isLiked ?? false,
      count: selectedImage.likes,
    };
    setLikeState((state) => ({
      ...state,
      [selectedImage.id]: {
        liked: !current.liked,
        count: current.count + (current.liked ? -1 : 1),
      },
    }));
    toggleLike.mutate(
      { imageId: selectedImage.id },
      {
        onError: () =>
          setLikeState((state) => ({ ...state, [selectedImage.id]: current })),
      },
    );
  };

  useEffect(() => {
    if (!session || !albumId || !images?.length || toggleLike.isPending) return;
    const pending = sessionStorage.getItem("pending-gallery-like");
    if (!pending) return;

    try {
      const request = JSON.parse(pending) as {
        albumId?: string;
        imageId?: string;
      };
      if (request.albumId !== albumId || !request.imageId) return;
      const index = images.findIndex((image) => image.id === request.imageId);
      if (index < 0) return;
      const image = images[index];
      if (!image) return;

      sessionStorage.removeItem("pending-gallery-like");
      setSelectedIndex(index);
      if (image.isLiked) {
        setLikeState((state) => ({
          ...state,
          [image.id]: { liked: true, count: image.likes },
        }));
        return;
      }

      toggleLike.mutate(
        { imageId: image.id },
        {
          onSuccess: (result) =>
            setLikeState((state) => ({
              ...state,
              [image.id]: {
                liked: result.isLiked,
                count: result.likes,
              },
            })),
          onError: () => toast.error("The photograph could not be liked"),
        },
      );
    } catch {
      sessionStorage.removeItem("pending-gallery-like");
    }
  }, [albumId, images, session, toggleLike]);

  const shareAlbum = async (folder: NonNullable<typeof folders>[number]) => {
    const url = `${window.location.origin}/gallery/${folder.id}?share=1`;
    const date = new Date(folder.eventDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const text = [
      folder.eventName,
      date,
      "",
      "Photographs from St. Joseph Church, Belman",
      "Open the album and download the photographs you want:",
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: folder.eventName, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Album details and link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Album details and link copied");
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

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
                    src={
                      folder.previewImage
                        ? cloudinaryUrl(
                            folder.previewImage,
                            "c_fill,g_auto,w_720,h_540,q_auto,f_auto",
                          )
                        : "/favicon.webp"
                    }
                    alt={folder.eventName}
                    fill
                    unoptimized={Boolean(folder.previewImage)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                  {folder.contributors.length > 0 && (
                    <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                      <div className="flex -space-x-2">
                        {folder.contributors.slice(0, 3).map((contributor) =>
                          contributor.image ? (
                            <Image
                              key={contributor.id}
                              src={contributor.image}
                              alt={contributor.name ?? "Album contributor"}
                              width={28}
                              height={28}
                              unoptimized
                              className="h-7 w-7 rounded-full border-2 border-[#211811] object-cover"
                            />
                          ) : (
                            <span
                              key={contributor.id}
                              className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#211811] bg-[#f0c878] text-[10px] font-bold text-[#211811]"
                            >
                              {contributor.name?.charAt(0).toUpperCase() ?? "?"}
                            </span>
                          ),
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs leading-5 text-white/45">
                        Added by{" "}
                        {folder.contributors
                          .map((person) => person.name ?? "Contributor")
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </button>
              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => void shareAlbum(folder)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-white/65 transition hover:border-[#f0c878]/50 hover:text-[#f0c878] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878]"
                  aria-label={`Share ${folder.eventName}`}
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
                        onClick={() => setSelectedIndex(index)}
                        className="relative aspect-square overflow-hidden rounded-xl bg-white/5"
                      >
                        <Image
                          src={cloudinaryUrl(
                            image.url,
                            "c_fill,g_auto,w_600,h_600,q_auto,f_auto",
                          )}
                          alt={`${activeFolder?.eventName ?? "Album"} photograph ${index + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition hover:scale-105"
                        />
                        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                          <Heart size={12} />
                          {likeState[image.id]?.count ?? image.likes}
                        </span>
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
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) moveImage(1);
                if (info.offset.x > 70) moveImage(-1);
              }}
              className="relative flex max-h-full max-w-6xl flex-col items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="mb-3 text-center text-xs text-white/45 sm:hidden">
                Swipe left or right for more
              </p>
              <img
                src={selectedImage.url}
                alt="Selected gallery photograph"
                className="max-h-[76vh] max-w-full select-none object-contain"
                draggable={false}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${(likeState[selectedImage.id]?.liked ?? selectedImage.isLiked) ? "bg-red-500 text-white" : "bg-white/10 text-white"}`}
                >
                  <Heart
                    size={16}
                    fill={
                      (likeState[selectedImage.id]?.liked ??
                      selectedImage.isLiked)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  {likeState[selectedImage.id]?.count ?? selectedImage.likes}{" "}
                  likes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(selectedImage.url);
                    toast.success("Image link copied");
                  }}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
                >
                  <Link2 size={16} />
                  Copy link
                </button>
                <a
                  href={downloadUrl(selectedImage.url)}
                  download
                  className="flex items-center gap-2 rounded-full bg-[#f0c878] px-4 py-2 text-sm font-medium text-[#211811]"
                >
                  <Download size={16} />
                  Download
                </a>
                <span className="self-center text-xs text-white/40">
                  {(selectedIndex ?? 0) + 1} of {images?.length ?? 0}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ThemedToast />
    </PageShell>
  );
}
