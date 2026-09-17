/* eslint-disable @next/next/no-img-element */
"use client";
import imageCompression from "browser-image-compression";
import { ImagePlus, Info, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

export default function AdminGallery() {
  const [files, setFiles] = useState<File[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );
  const { uploadImages } = useCloudinaryUpload();
  const publish = api.gallery.uploadGallery.useMutation({
    onSuccess: () => {
      toast.success("Gallery published");
      setFiles([]);
      setEventName("");
      setEventDate("");
    },
    onError: (e) => toast.error(e.message),
  });
  const addFiles = async (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length + next.length > 200) {
      toast.error("A gallery can contain up to 200 photographs");
      return;
    }
    const id = toast.loading(`Preparing ${next.length} photographs…`);
    try {
      const compressed = await Promise.all(
        next.map((file) =>
          imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
          }),
        ),
      );
      setFiles((current) => [...current, ...compressed]);
      toast.update(id, {
        render: `${compressed.length} photographs ready`,
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch {
      toast.update(id, {
        render: "Could not prepare the photographs",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  const submit = async () => {
    if (!eventName.trim() || !eventDate || !files.length) {
      toast.error("Add the event name, date and photographs");
      return;
    }
    try {
      const urls = await uploadImages(files, `${eventName} - ${eventDate}`);
      publish.mutate({ eventName: eventName.trim(), eventDate, images: urls });
    } catch {
      toast.error("Upload did not complete. Please try again.");
    }
  };
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER", "PHOTOGRAPHER"]}>
      <PageShell
        admin
        title="Gallery"
        description="Prepare and publish a complete event album from one place."
      >
        <ToastContainer />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_24rem]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/90">
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center border-b border-dashed border-white/15 p-8 text-center transition hover:bg-white/[0.03]">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void addFiles(e.target.files)}
              />
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f0c878]/10 text-[#f0c878]">
                <ImagePlus />
              </span>
              <span className="mt-4 text-xl font-semibold">
                Choose photographs
              </span>
              <span className="mt-2 max-w-md text-sm leading-6 text-white/45">
                JPG, PNG or WebP. Images are compressed before upload. You can
                add more in several batches.
              </span>
            </label>
            {previews.length ? (
              <div className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-white/55">
                    {files.length} of 200 photographs
                  </p>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-sm text-white/55 hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid max-h-[34rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                  {previews.map(({ file, url }, index) => (
                    <figure
                      key={`${file.name}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-black/30"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                        className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
          <aside className="h-fit rounded-3xl border border-white/10 bg-[#211811]/90 p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Album details</h2>
            <label className="mt-6 block text-sm text-white/55">
              Event name
              <input
                value={eventName}
                onChange={(e) =>
                  setEventName(
                    e.target.value.replace(/\b\w/g, (c) => c.toUpperCase()),
                  )
                }
                placeholder="Parish feast"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
              />
            </label>
            <label className="mt-5 block text-sm text-white/55">
              Event date
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
              />
            </label>
            <div className="mt-6 flex gap-3 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-white/50">
              <Info className="mt-0.5 shrink-0 text-[#f0c878]" size={18} />
              <p>
                Use the same event name and date when adding photographs to an
                existing album.
              </p>
            </div>
            <button
              type="button"
              disabled={publish.isPending}
              onClick={() => void submit()}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-50"
            >
              <Upload size={18} />
              {publish.isPending ? "Publishing…" : "Publish album"}
            </button>
          </aside>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
