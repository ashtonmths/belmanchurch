"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadFile } from "~/lib/upload";

/**
 * Drag-and-drop image uploader with previews. Works for a single image
 * (`multiple={false}`, value has at most one URL) or a reorderable list.
 */
export default function ImageUploader({
  value,
  onChange,
  folder,
  multiple = false,
  label = "Upload images",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  multiple?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    const batch = multiple ? images : images.slice(0, 1);
    setUploading(batch.length);

    const uploaded: string[] = [];
    for (const file of batch) {
      try {
        uploaded.push(await uploadFile(file, folder));
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`);
      }
      setUploading((n) => n - 1);
    }
    if (uploaded.length) onChange(multiple ? [...value, ...uploaded] : uploaded);
  }

  const move = (i: number, delta: number) => {
    const next = [...value];
    const j = i + delta;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className={`mb-3 grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:max-w-sm"}`}>
          {value.map((url, i) => (
            <li
              key={url}
              className="group relative aspect-video overflow-hidden rounded-xl border border-accent/15 bg-cream"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {multiple && i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-cream">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                {multiple ? (
                  <span className="flex gap-1">
                    <IconButton label="Move left" onClick={() => move(i, -1)}>
                      <ArrowLeft size={14} />
                    </IconButton>
                    <IconButton label="Move right" onClick={() => move(i, 1)}>
                      <ArrowRight size={14} />
                    </IconButton>
                  </span>
                ) : (
                  <span />
                )}
                <IconButton label="Remove image" onClick={() => onChange(value.filter((u) => u !== url))}>
                  <X size={14} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(multiple || value.length === 0) && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            dragging ? "border-accent bg-primary/20" : "border-accent/25 bg-cream/50 hover:border-accent"
          }`}
        >
          {uploading > 0 ? (
            <>
              <Loader2 className="animate-spin text-accent" />
              <span className="text-sm font-medium text-ink">Uploading {uploading}…</span>
            </>
          ) : (
            <>
              <ImagePlus className="text-accent" />
              <span className="text-sm font-semibold text-ink">{label}</span>
              <span className="text-xs text-textcolor/60">
                Click or drag {multiple ? "photos" : "a photo"} here · JPG, PNG or WebP
              </span>
            </>
          )}
        </button>
      )}
      {!multiple && value.length > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-semibold text-accent hover:text-ink"
        >
          Replace image
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-full bg-white/90 p-1.5 text-ink transition hover:bg-white"
    >
      {children}
    </button>
  );
}
