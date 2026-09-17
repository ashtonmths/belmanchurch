import imageCompression from "browser-image-compression";

/**
 * Uploads a file from the admin panel and returns its public URL.
 *
 * - Local development (NEXT_PUBLIC_UPLOAD_STORAGE="local"): posts to /api/upload.
 * - Production: uploads directly to Cloudinary with the unsigned preset, which
 *   avoids Vercel's 4.5 MB request limit.
 *
 * Images are compressed in the browser first.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const isImage = file.type.startsWith("image/") && file.type !== "image/gif";
  const body = isImage
    ? await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 2560, useWebWorker: true })
    : file;

  const form = new FormData();
  form.append("file", body, file.name);
  form.append("folder", folder);

  if (process.env.NEXT_PUBLIC_UPLOAD_STORAGE === "local") {
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
    return data.url;
  }

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) throw new Error("Cloudinary is not configured");
  form.append("upload_preset", preset);
  const kind = file.type === "application/pdf" ? "raw" : "image";
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${kind}/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { secure_url?: string; error?: { message: string } };
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? "Upload failed");
  return data.secure_url;
}
