"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Button from "~/components/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

export default function AdminGallery() {
  const [images, setImages] = useState<File[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  const router = useRouter();

  // tRPC Mutation for uploading gallery
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
        maxSizeMB: 1, // Keep file under 1MB
        maxWidthOrHeight: 1024, // Resize if necessary
        useWebWorker: true, // Use Web Workers for performance
      };
  
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Compression error:", error);
      return file; // Return original file if compression fails
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const totalFiles = files.length;

    // Show initial toast with progress
    const toastId = toast.info(`Compressing images... (0/${totalFiles})`, {
      autoClose: false,
      progress: 0,
    });

    try {
      let completed = 0;
      const compressedFiles: File[] = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file);
          completed++;

          // Update progress in the toast
          toast.update(toastId, {
            render: `Compressing images... (${completed}/${totalFiles})`,
            progress: completed / totalFiles,
          });

          return compressed;
        }),
      );

      setImages([...images, ...compressedFiles]);

      // Update toast to success
      toast.update(toastId, {
        render: "Images compressed and added successfully!",
        type: "success",
        autoClose: 3000,
        progress: undefined,
      });
    } catch (error) {
      console.error("Image compression failed:", error);

      // Update toast to error state
      toast.update(toastId, {
        render: "Failed to compress images.",
        type: "error",
        autoClose: 3000,
        progress: undefined,
      });
    }
  };

  const handleDiscard = () => {
    setImages([]);
    setEventName("");
    setEventDate("");
    toast.warn("Upload discarded.");
  };

  const formatEventName = (name: string) => {
    return name.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSubmit = async () => {
    if (!eventName || !eventDate || images.length === 0) {
      toast.error("Please fill all fields and upload images.");
      return;
    }

    try {
      // Convert images to Base64
      const base64Images = await Promise.all(
        images.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
        }),
      );

      // Call the backend
      uploadGallery.mutate({ eventName, eventDate, images: base64Images });
    } catch (error) {
      console.error("Error encoding images:", error);
      toast.error("Error processing images.");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/admin.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/40 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center rounded-xl border-2 border-primary bg-black/40 text-center">
          <div className="grid w-full max-w-5xl gap-4 p-4 md:grid-cols-3">
            {/* Upload Box */}
            <div className="group relative flex h-80 w-full items-center justify-center">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-primary shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/10">
                <div className="relative flex h-full w-full flex-col items-center justify-center p-6">
                  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent bg-secondary/50 p-8 transition-colors group-hover/dropzone:border-cyan-500/50">
                    <input
                      type="file"
                      className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                      multiple
                      accept="image/png, image/jpeg"
                      onChange={handleFileUpload}
                    />
                    <div className="space-y-6 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                        <svg
                          className="h-10 w-10 text-textcolor"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                      </div>
                      {images.length > 0 ? (
                        <p className="mt-2 text-xl text-textcolor">
                          Number of Images: {images.length}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-base font-medium text-textcolor">
                            Drop your files here or browse
                          </p>
                          <p className="text-sm text-textcolor">
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
                onChange={(e) => setEventName(formatEventName(e.target.value))}
                className="h-12 w-[80%] rounded-full border-2 border-accent/50 bg-primary p-4 text-xl placeholder-textcolor focus:border-accent focus:text-textcolor focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="h-12 w-[80%] rounded-full border-2 border-accent/50 bg-primary p-4 text-xl placeholder-textcolor focus:border-accent focus:text-textcolor focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Action Buttons */}
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
