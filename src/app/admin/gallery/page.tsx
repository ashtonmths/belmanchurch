/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { api } from "~/trpc/react";
import Button from "~/components/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import ProtectedRoute from "~/components/ProtectRoute";
import { Eye, Trash2 } from "lucide-react";

const instructions = [
  "Upload a maximum of 200 photos per event.",
  "Avoid uploading personal photos (e.g., posed shots taken on request).",
  "Use a PC and a stable Wi-Fi connection for optimal upload speed.",
  "Coordinate with fellow photographers. For example, one person uploads the first 50 images, another uploads the next 50, and so on.",
  "If someone has already uploaded photos for the event, use the *exact same event name and date*, matching the casing.",
  "Capitalize the first letter of every word in the event name.",
  "After publishing, you can copy the gallery link by navigating to the homepage, opening the event folder, and clicking 'Copy Link'.",
  "For any issues, contact ashtonmths@outlook.com or WhatsApp +91 8150947796.",
];

export default function AdminGallery() {
  const [images, setImages] = useState<File[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const router = useRouter();

  const uploadGallery = api.gallery.uploadGallery.useMutation({
    onSuccess: () => {
      toast.success("Gallery uploaded successfully!");
      router.refresh();
      setImages([]);
      setEventName("");
      setEventDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload gallery.");
    },
  });

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression error:", error);
      return file;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newFiles = files.filter(
      (file) =>
        !images.some((img) => img.name === file.name && img.size === file.size)
    );

    const totalImagesAfterUpload = images.length + newFiles.length;
    if (totalImagesAfterUpload > 200) {
      toast.error("You can upload a maximum of 200 images per event.");
      return;
    }

    const totalFiles = newFiles.length;
    const toastId = toast.info(`Compressing images... (0/${totalFiles})`, {
      autoClose: false,
      progress: 0,
    });

    try {
      let completed = 0;
      const compressedFiles: File[] = await Promise.all(
        newFiles.map(async (file) => {
          const compressed = await compressImage(file);
          completed++;
          toast.update(toastId, {
            render: `Compressing images... (${completed}/${totalFiles})`,
            progress: completed / totalFiles,
          });
          return compressed;
        })
      );

      setImages((prev) => [...prev, ...compressedFiles]);
      toast.update(toastId, {
        render: "Images compressed and added successfully!",
        type: "success",
        autoClose: 3000,
        progress: undefined,
      });
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.update(toastId, {
        render: "Failed to compress images.",
        type: "error",
        autoClose: 3000,
        progress: undefined,
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleDiscard = () => {
    setImages([]);
    setEventName("");
    setEventDate("");
    toast.warn("Upload discarded.");
  };

  const formatEventName = (name: string) =>
    name.replace(/\b\w/g, (char) => char.toUpperCase());

  const { uploadImages } = useCloudinaryUpload();

  const handleSubmit = async () => {
    if (!eventName || !eventDate || images.length === 0) {
      toast.error("Please fill all fields and upload images.");
      return;
    }

    try {
      const folderName = `${eventName} - ${eventDate}`;
      const urls = await uploadImages(images, folderName);

      uploadGallery.mutate({
        eventName,
        eventDate,
        images: urls,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER", "PHOTOGRAPHER"]}>
      <div className="relative flex h-screen w-full items-center justify-center bg-[url('/bg/admin.jpg')] bg-cover bg-center">
        <div className="flex h-screen w-full items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center overflow-y-auto rounded-xl border-2 border-primary bg-black/40 text-center">
            {showInstructions && (
              <div className="absolute left-1/2 top-20 z-50 w-[90%] max-w-3xl -translate-x-1/2 rounded-xl border-2 border-primary bg-black/90 p-6 text-left font-semibold text-primary shadow-xl backdrop-blur-md md:text-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">
                  Instructions
                </h2>
                <ul className="list-disc space-y-2 pl-6">
                  {instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="rounded-full bg-primary px-6 py-2 text-black hover:bg-accent"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="grid w-full max-w-5xl gap-4 p-4 md:grid-cols-3">
              {/* Upload box */}
              <div className="group relative flex h-80 w-full items-center justify-center">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-primary shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/10">
                  <div className="flex h-full w-full flex-col items-center justify-center p-4">
                    <div className="relative h-full w-full overflow-auto border-2 border-dashed border-accent bg-secondary/50 p-4 text-textcolor group-hover:border-cyan-500/50">
                      <label className="absolute inset-0 z-10 cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg, image/png"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                        {images.length > 0 ? (
                          images.map((file, index) => (
                            <div
                              key={index}
                              className="group/image relative h-32 overflow-hidden rounded-md border border-white"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover/image:opacity-100">
                                <button
                                  onClick={() =>
                                    setFullscreenImage(
                                      URL.createObjectURL(file)
                                    )
                                  }
                                  className="rounded-full bg-white p-1"
                                >
                                  <Eye className="text-black" />
                                </button>
                                <button
                                  onClick={() => handleRemoveImage(index)}
                                  className="rounded-full bg-red-600 p-1"
                                >
                                  <Trash2 className="text-white" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center flex justify-center items-center flex-col">
                            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                              <svg
                                className="h-10 w-10 text-textcolor"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <p className="font-medium">
                              Drop your files here or browse
                            </p>
                            <p className="text-sm">
                              Supported: JPG, PNG | Max 8MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="flex h-80 flex-col items-center justify-center space-y-8 p-4">
                <input
                  type="text"
                  placeholder="Event Name"
                  value={eventName}
                  onChange={(e) =>
                    setEventName(formatEventName(e.target.value))
                  }
                  className="h-12 w-[80%] rounded-full border-2 border-accent/50 bg-primary p-4 text-xl placeholder-textcolor focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-12 w-[80%] rounded-full border-2 border-accent/50 bg-primary p-4 text-xl placeholder-textcolor focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Buttons */}
              <div className="flex h-80 flex-col items-center justify-center space-y-8">
                <Button onClick={handleSubmit} className="h-12 w-40">
                  Publish
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDiscard}
                  className="h-12 w-40"
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {fullscreenImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
            onClick={() => setFullscreenImage(null)}
          >
            <img
              src={fullscreenImage}
              className="max-h-[90%] max-w-[90%] rounded-xl"
              alt="Full View"
            />
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ProtectedRoute>
  );
}
