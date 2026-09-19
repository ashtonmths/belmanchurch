import { useState } from "react";
import { toast } from "react-toastify";

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (
    files: File[],
    folderName: string,
  ): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls = new Array<string>(files.length);
    let uploadedCount = 0;

    const toastId = toast.info(`Uploading 0/${files.length} images...`, {
      autoClose: false,
      progress: 0,
    });

    const uploadOne = async (i: number) => {
      const file = files[i];
      try {
        const formData = new FormData();
        if (file) {
          formData.append("file", file);
        } else {
          throw new Error(`File at index ${i} is undefined`);
        }
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
          throw new Error(
            "CLOUDINARY_UPLOAD_PRESET is not defined in environment variables",
          );
        }
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        );
        formData.append("folder", folderName);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) throw new Error(`Upload failed for image ${i + 1}`);

        const data = (await response.json()) as { secure_url: string };
        uploadedUrls[i] = data.secure_url;
        uploadedCount += 1;

        toast.update(toastId, {
          render: `Uploading ${uploadedCount}/${files.length} images...`,
          progress: uploadedCount / files.length,
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
    };

    const workerCount = Math.min(5, files.length);
    let nextIndex = 0;
    const workers = Array.from({ length: workerCount }, async () => {
      while (nextIndex < files.length) {
        const index = nextIndex;
        nextIndex += 1;
        await uploadOne(index);
      }
    });
    await Promise.all(workers);

    toast.update(toastId, {
      render: `Uploaded ${files.length} images successfully!`,
      type: "success",
      autoClose: 3000,
      progress: undefined,
    });

    setIsUploading(false);
    return uploadedUrls.filter((url): url is string => Boolean(url));
  };

  return { uploadImages, isUploading };
}
