/* eslint-disable @next/next/no-img-element */
"use client";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import { FaHeart, FaShareAlt, FaDownload } from "react-icons/fa";
import Image from "next/image";
import Button from "../../../components/Button";
import { ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";

const GalleryPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const updateLikeMutation = api.gallery.toggleLike.useMutation();
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const { data, isFetching, isError } = api.gallery.getImagesByID.useQuery(
    { id: id },
    { enabled: !!id },
  );
  const [selectedImage, setSelectedImage] = useState<{
    id: string;
    url: string;
    likes: number;
    uploadedBy: { id: string; name: string | null; image: string } | null;
    isLiked: boolean;
  } | null>(null);
  const imageslength = data?.length ?? 0;

  const handleLike = (imageId: string) => {
    if (!session) {
      toast.error("Please log in to like images.", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        router.push("/api/auth/signin");
      }, 2000);
      return;
    }

    const isLiked = likes[imageId] ?? false;

    setLikes((prevLikes) => ({
      ...prevLikes,
      [imageId]: !isLiked,
    }));

    // 🔥 Ensure like count updates correctly when unliking
    if (selectedImage?.id === imageId) {
      setSelectedImage(
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

          if (selectedImage?.id === imageId) {
            setSelectedImage(
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

  useEffect(() => {
    if (selectedImage) {
      setLikes((prevLikes) => ({
        ...prevLikes,
        [selectedImage.id]: selectedImage.isLiked,
      }));
    }
  }, [selectedImage]);

  const handleShare = async () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          url: selectedImage?.url ?? undefined,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      if (selectedImage) {
        await navigator.clipboard.writeText(selectedImage.url);
      } else {
        console.error("No image URL to copy");
      }
      alert("Image link copied to clipboard!");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error("Failed to copy link:", err);
    }
  };

  const handleDownload = async () => {
    if (!selectedImage) {
      console.error("No image URL to download");
      return;
    }

    try {
      const response = await fetch(selectedImage.url);
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
  if (isFetching) {
    return <p>Loading gallery...</p>;
  }

  if (isError) {
    return <p>Error fetching gallery data.</p>;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex h-[81%] min-h-0 w-[90%] flex-col items-center gap-6 overflow-y-auto overflow-x-hidden p-6 text-center md:flex-row md:flex-wrap md:justify-center">
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-20 flex h-full w-full flex-col items-center justify-center overflow-y-hidden bg-black/60 p-6 pt-[30%] md:pt-[8%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              {isFetching ? (
                <p className="text-3xl font-semibold text-primary">
                  Loading images...
                </p>
              ) : imageslength > 0 ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                    <Button
                      className="relative z-30 h-9"
                      onClick={() => {
                        setSelectedImage(null);
                        router.push("/gallery");
                      }}
                      variant="destructive"
                    >
                      Close
                    </Button>
                    <Button className="relative z-30 h-9" onClick={handleCopy}>
                      Copy Link
                    </Button>
                  </div>
                  <div className="relative mt-5 h-[80%] w-full overflow-y-auto p-4 md:w-[90%]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      {data?.map((img, index) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          whileHover={{ scale: 1.05 }}
                          className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage({
                              id: img.id,
                              url: img.url,
                              likes: img.likes,
                              uploadedBy: img.uploadedBy
                                ? {
                                    id: img.uploadedBy.id,
                                    name: img.uploadedBy.name,
                                    image:
                                      img.uploadedBy.image ?? "/favicon.webp",
                                  }
                                : null,
                              isLiked: likes[img.id] ?? img.isLiked ?? false,
                            });
                            setLikes((prevLikes) => ({
                              ...prevLikes,
                              [img.id]: likes[img.id] ?? img.isLiked ?? false, // same defaulting here
                            }));
                          }}
                        >
                          <Image
                            src={img.url}
                            alt={`Image ${index + 1}`}
                            layout="fill"
                            loading="lazy"
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
                <>
                  <Button
                    className="relative z-30 mb-10"
                    onClick={() => {
                      setSelectedImage(null);
                      router.push("/gallery");
                    }}
                  >
                    Close
                  </Button>
                  <p className="text-4xl font-semibold text-primary">
                    No images found
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {selectedImage && (
              <motion.div
                className="fixed inset-0 bottom-0 z-30 flex h-full w-full flex-col items-center justify-center bg-black/90 pt-[30%] md:pt-[8%]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
              >
                {/* Close Button */}
                <Button
                  className="relative z-20 mt-[34px]"
                  onClick={() => setSelectedImage(null)}
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
                    <div className="relative flex w-full items-center justify-center overflow-hidden md:-mt-20">
                      <Zoom>
                        <img
                          src={selectedImage.url}
                          alt="Full-Screen Image"
                          className="rounded-t-lg pt-[17.5%]"
                        />
                      </Zoom>
                    </div>

                    {/* Actions Section */}
                    <div className="flex w-full items-center justify-around bg-primary p-4 text-gray-700">
                      <button
                        className="flex flex-col items-center justify-center gap-2 text-textcolor hover:text-red-500 md:flex-row"
                        onClick={() => handleLike(selectedImage.id)}
                      >
                        <FaHeart
                          className={
                            likes[selectedImage.id]
                              ? "text-red-500"
                              : "text-gray-400"
                          }
                        />
                        {selectedImage.likes} Likes
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
                        {selectedImage.uploadedBy?.name}
                      </span>
                      {selectedImage.uploadedBy?.image && (
                        <Image
                          src={
                            selectedImage.uploadedBy.image ?? "/favicon.webp"
                          }
                          alt={selectedImage.uploadedBy.name ?? "Uploader"}
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
  );
};

export default GalleryPage;
