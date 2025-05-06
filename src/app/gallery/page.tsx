/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import ProtectedRoute from "~/components/ProtectRoute";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "~/components/Button";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { FaHeart, FaShareAlt, FaDownload } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Gallery() {
  const { data: folders, isLoading, error } = api.gallery.getFolders.useQuery();
  const { status } = useSession();
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [fullScreenImage, setFullScreenImage] = useState<{
    id: string;
    url: string;
    likes: number;
    uploadedBy: { id: string; name: string | null; image: string } | null;
    isLiked: boolean;
  } | null>(null);
  const { data: images = [], isFetching } = api.gallery.getImages.useQuery(
    { folder: selectedFolder ?? "" },
    { enabled: !!selectedFolder },
  );
  const updateLikeMutation = api.gallery.toggleLike.useMutation();

  useEffect(() => {
    if (fullScreenImage) {
      setLikes((prevLikes) => ({
        ...prevLikes,
        [fullScreenImage.id]: fullScreenImage.isLiked,
      }));
    }
  }, [fullScreenImage]);
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const handleLike = (imageId: string) => {
    const isLiked = likes[imageId] ?? false;

    setLikes((prevLikes) => ({
      ...prevLikes,
      [imageId]: !isLiked,
    }));

    // 🔥 Ensure like count updates correctly when unliking
    if (fullScreenImage?.id === imageId) {
      setFullScreenImage(
        (prev) =>
          prev && {
            ...prev,
            isLiked: !isLiked,
            likes: prev.likes + (!isLiked ? 1 : -1), // Ensure unliking decreases count
          },
      );
    }

    updateLikeMutation.mutate(
      { imageId },
      {
        onSuccess: () => {
          toast.success(
            isLiked ? "You unliked the image!" : "You liked the image!",
            {
              position: "top-right",
              autoClose: 2000,
            },
          );
        },
        onError: (error) => {
          setLikes((prevLikes) => ({
            ...prevLikes,
            [imageId]: isLiked, // Rollback in case of failure
          }));

          if (fullScreenImage?.id === imageId) {
            setFullScreenImage(
              (prev) =>
                prev && {
                  ...prev,
                  isLiked: isLiked, // Rollback the heart color
                  likes: prev.likes + (isLiked ? 1 : -1), // Fix rollback issue
                },
            );
          }

          toast.error(error.message || "Something went wrong!", {
            position: "top-right",
            autoClose: 3000,
          });
        },
      },
    );
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  const openSlideshow = (folder: string) => {
    setSelectedFolder(folder);
  };

  const closeSlideshow = () => {
    setSelectedFolder(null);
    setFullScreenImage(null);
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          url: fullScreenImage?.url ?? undefined,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      if (fullScreenImage) {
        await navigator.clipboard.writeText(fullScreenImage.url);
      } else {
        console.error("No image URL to copy");
      }
      alert("Image link copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    if (!fullScreenImage) {
      console.error("No image URL to download");
      return;
    }

    try {
      const response = await fetch(fullScreenImage.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "image.jpg"; // Change filename if needed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

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
                  onClick={() => openSlideshow(folder.cloudinaryFolder)}
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
            <AnimatePresence>
              {selectedFolder && (
                <motion.div
                  className="fixed inset-0 z-20 flex h-full w-full flex-col items-center justify-center overflow-y-hidden bg-black/90 p-6 pt-[30%] md:pt-[8%]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeSlideshow}
                >
                  {isFetching ? (
                    <p className="text-3xl font-semibold text-primary">
                      Loading images...
                    </p>
                  ) : images.length > 0 ? (
                    <>
                      <Button
                        className="relative z-30"
                        onClick={closeSlideshow}
                      >
                        Close
                      </Button>
                      <div className="relative mt-5 h-[80%] w-full overflow-y-auto p-4 md:w-[90%]">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                          {images.map((img, index) => (
                            <motion.div
                              key={img.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              whileHover={{ scale: 1.05 }}
                              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFullScreenImage({
                                  id: img.id,
                                  url: img.url,
                                  likes: img.likes,
                                  uploadedBy: img.uploadedBy
                                    ? {
                                        id: img.uploadedBy.id,
                                        name: img.uploadedBy.name,
                                        image:
                                          img.uploadedBy.image ??
                                          "/favicon.webp",
                                      }
                                    : null,
                                  isLiked: likes[img.id] ?? img.isLiked,
                                });
                                setLikes((prevLikes) => ({
                                  ...prevLikes,
                                  [img.id]: likes[img.id] ?? img.isLiked,
                                }));
                              }}
                            >
                              <Image
                                src={img.url}
                                alt={`Image ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                                unoptimized
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-white">No images found</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full-Screen Image View */}
            <AnimatePresence>
              {fullScreenImage && (
                <motion.div
                  className="fixed inset-0 bottom-0 z-30 flex h-full w-full flex-col items-center justify-center bg-black/90 pt-[30%] md:pt-[8%]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFullScreenImage(null)}
                >
                  {/* Close Button */}
                  <Button
                    className="relative z-20 mt-[34px]"
                    onClick={() => setFullScreenImage(null)}
                  >
                    Back to Folder
                  </Button>

                  <motion.div
                    className="relative mt-12 flex h-full w-[80%] items-start justify-center overflow-y-auto"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing on click inside
                  >
                    <div className="flex w-11/12 max-w-sm flex-col overflow-hidden rounded-lg shadow-lg transition-transform">
                      {/* Image Section */}
                      <div className="relative w-full md:-mt-20">
                        <Zoom>
                          <img
                            src={fullScreenImage.url}
                            alt="Full-Screen Image"
                            className="rounded-t-lg pt-[17.5%]"
                          />
                        </Zoom>
                      </div>

                      {/* Actions Section */}
                      <div className="flex w-full items-center justify-around bg-primary p-4 text-gray-700">
                        <button
                          className="flex flex-col items-center justify-center gap-2 text-textcolor hover:text-red-500 md:flex-row"
                          onClick={() => handleLike(fullScreenImage.id)}
                        >
                          <FaHeart
                            className={
                              likes[fullScreenImage.id]
                                ? "text-red-500"
                                : "text-gray-400"
                            }
                          />
                          {fullScreenImage.likes} Likes
                        </button>

                        <button
                          className="flex flex-col items-center justify-center gap-2 text-textcolor hover:text-blue-500 md:flex-row"
                          onClick={handleShare}
                        >
                          <FaShareAlt /> Share
                        </button>
                        <button
                          className="flex flex-col items-center justify-center gap-2 text-textcolor hover:text-green-500 md:flex-row"
                          onClick={handleDownload}
                        >
                          <FaDownload /> Download
                        </button>
                      </div>

                      {/* Uploader Info */}
                      <div className="flex w-full items-center justify-center gap-2 bg-secondary p-3 text-sm text-textcolor">
                        Uploaded by{" "}
                        <span className="font-semibold">
                          {fullScreenImage.uploadedBy?.name}
                        </span>
                        {fullScreenImage.uploadedBy?.image && (
                          <Image
                            src={
                              fullScreenImage.uploadedBy.image ??
                              "/favicon.webp"
                            }
                            alt={fullScreenImage.uploadedBy.name ?? "Uploader"}
                            width={32}
                            height={32}
                            className="rounded-full border"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ProtectedRoute>
  );
}
