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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Gallery() {
  const { data: folders, isLoading, error } = api.gallery.getFolders.useQuery();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<{
    id: string;
    url: string;
    uploadedBy: { id: string; name: string | null; image: string } | null;
  } | null>(null);
  const updateLikeMutation = api.gallery.updateLike.useMutation();
  const { data: images = [], isFetching } = api.gallery.getImages.useQuery(
    { folder: selectedFolder ?? "" },
    { enabled: !!selectedFolder },
  );

  useEffect(() => {
    if (images.length > 0) {
      setLikes((prevLikes) => {
        const newLikes = { ...prevLikes };
        images.forEach((img) => {
          if (!(img.id in newLikes)) {
            newLikes[img.id] = img.likes;
          }
        });
        return newLikes;
      });
    }
  }, [images]); // Runs when images change

  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (imageId: string) => {
    // Check if the user has already liked the image
    if (likes[imageId]) {
      toast.info("You already liked this image!", {
        position: "top-right",
        autoClose: 2000,
      });
      return; // Prevent API call
    }

    updateLikeMutation.mutate(
      { imageId },
      {
        onSuccess: (data) => {
          setLikes((prevLikes) => ({
            ...prevLikes,
            [imageId]: data.likes,
          }));
          toast.success("You liked the image!", {
            position: "top-right",
            autoClose: 2000,
          });
        },
        onError: (error) => {
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

  const handleDownload = () => {
    if (fullScreenImage) {
      const link = document.createElement("a");
      link.href = fullScreenImage.url; // Safe assignment
      link.download = "image.jpg"; // Default filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("No image URL to download");
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["PARISHONER", "PHOTOGRAPHER", "ADMIN", "DEVELOPER"]}
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
                    {folder.eventDate.toLocaleDateString()}
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
                      <div className="relative mt-5 h-[80%] w-[90%] overflow-y-auto p-4">
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
                                  uploadedBy: img.uploadedBy
                                    ? {
                                        id: img.uploadedBy.id,
                                        name: img.uploadedBy.name,
                                        image:
                                          img.uploadedBy.image ??
                                          "/favicon.webp",
                                      }
                                    : null,
                                });
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
                  className="fixed inset-0 z-30 flex h-full w-full flex-col items-center justify-center bg-black/90 pt-[30%] md:pt-[8%]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFullScreenImage(null)}
                >
                  {/* Close Button */}
                  <Button
                    className="relative z-30 mt-[34px]"
                    onClick={() => setFullScreenImage(null)}
                  >
                    Back to Folder
                  </Button>

                  <motion.div
                    className="relative mt-12 flex h-[80%] w-[80%] items-start justify-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing on click inside
                  >
                    <div className="w-11/12 max-w-sm overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
                      {/* Image Section */}
                      <div
                        className="relative w-full"
                      >
                        <Zoom>
                          <Image
                            src={fullScreenImage.url}
                            alt="Full-Screen Image"
                            layout="fill"
                            objectFit="contain"
                            className="rounded-t-lg"
                          />
                        </Zoom>
                      </div>

                      {/* Actions Section */}
                      <div className="flex items-center justify-around border-t border-gray-200 bg-white p-4 text-gray-700">
                        <button
                          className="flex items-center gap-2 hover:text-red-500"
                          onClick={() => {
                            if (likes[fullScreenImage.id]) {
                              toast.info("You already liked this image!");
                              return;
                            }
                            handleLike(fullScreenImage.id);
                          }}
                        >
                          <FaHeart className="text-red-500" />{" "}
                          {likes[fullScreenImage.id]} Likes
                        </button>
                        <button
                          className="flex items-center gap-2 hover:text-blue-500"
                          onClick={handleShare}
                        >
                          <FaShareAlt /> Share
                        </button>
                        <button
                          className="flex items-center gap-2 hover:text-green-500"
                          onClick={handleDownload}
                        >
                          <FaDownload /> Download
                        </button>
                      </div>

                      {/* Uploader Info */}
                      <div className="flex items-center justify-center gap-2 bg-gray-100 p-3 text-sm text-gray-700">
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
