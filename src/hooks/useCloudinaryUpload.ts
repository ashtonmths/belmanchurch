import { useState } from "react";
import { toast } from "react-toastify";

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files: File[], folderName: string): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    const toastId = toast.info(`Uploading 0/${files.length} images...`, {
      autoClose: false,
      progress: 0,
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const formData = new FormData();
        if (file) {
          formData.append("file", file);
        } else {
          throw new Error(`File at index ${i} is undefined`);
        }
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
          throw new Error("CLOUDINARY_UPLOAD_PRESET is not defined in environment variables");
        }
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", folderName);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Upload failed for image ${i + 1}`);

        const data = await response.json() as { secure_url: string };
        uploadedUrls.push(data.secure_url);

        toast.update(toastId, {
          render: `Uploading ${i + 1}/${files.length} images...`,
          progress: (i + 1) / files.length,
        });

      } catch (err) {
        toast.update(toastId, {
          render: `Upload failed at image ${i + 1}`,
          type: "error",
          autoClose: 4000,
          progress: undefined,
        });
        setIsUploading(false);
        throw err;
      }
    }

    toast.update(toastId, {
      render: `Uploaded ${files.length} images successfully!`,
      type: "success",
      autoClose: 3000,
      progress: undefined,
    });

    setIsUploading(false);
    return uploadedUrls;
  };

  return { uploadImages, isUploading };
}
