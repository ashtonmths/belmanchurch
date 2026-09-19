/* eslint-disable @next/next/no-img-element */
"use client";
import imageCompression from "browser-image-compression";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Info,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import ThemedToast from "~/components/ThemedToast";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

export default function AdminGallery() {
  const [files, setFiles] = useState<File[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [thumbnailIndex, setThumbnailIndex] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );
  const { uploadImages, isUploading } = useCloudinaryUpload();
  const publish = api.gallery.uploadGallery.useMutation({
    onSuccess: () => {
      toast.success("Gallery published");
      setFiles([]);
      setEventName("");
      setEventDate("");
      setThumbnailIndex(null);
      setStep(1);
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
      if (files.length === 0 && compressed.length > 0) setThumbnailIndex(0);
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
    if (
      !eventName.trim() ||
      !eventDate ||
      !files.length ||
      thumbnailIndex === null
    ) {
      toast.error("Add the album details, photographs and a thumbnail");
      return;
    }
    try {
      const urls = await uploadImages(files, `${eventName} - ${eventDate}`);
      const thumbnailUrl = urls[thumbnailIndex];
      if (!thumbnailUrl)
        throw new Error("The selected thumbnail was not uploaded");
      publish.mutate({
        eventName: eventName.trim(),
        eventDate,
        images: urls,
        thumbnailUrl,
      });
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
        <ThemedToast />
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#211811]/80 px-5 py-5 sm:px-7">
          <div
            className="relative ml-[16.6667%] mr-[16.6667%] h-1 rounded-full bg-white/10"
            role="progressbar"
            aria-label="Gallery publishing progress"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#f0c878] transition-[width] duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            {[1, 2, 3].map((position) => (
              <span
                key={position}
                className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${position <= step ? "border-[#f0c878] bg-[#f0c878]" : "border-white/25 bg-[#211811]"}`}
                style={{ left: `${((position - 1) / 2) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 text-center text-xs sm:text-sm">
            {["Album details", "Photographs", "Review"].map((label, index) => (
              <span
                key={label}
                className={
                  step === index + 1
                    ? "font-semibold text-[#f0c878]"
                    : index + 1 < step
                      ? "text-white/70"
                      : "text-white/35"
                }
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_24rem]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/90">
            {step === 1 ? (
              <div className="p-5 sm:p-8">
                <h2 className="text-2xl font-semibold">Name this album</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  Use the exact same name and date when adding photographs to an
                  existing album.
                </p>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className="text-sm text-white/55">
                    Event name
                    <input
                      value={eventName}
                      onChange={(e) =>
                        setEventName(
                          e.target.value.replace(/\b\w/g, (c) =>
                            c.toUpperCase(),
                          ),
                        )
                      }
                      placeholder="Parish feast"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
                    />
                  </label>
                  <label className="text-sm text-white/55">
                    Event date
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
                    />
                  </label>
                </div>
              </div>
            ) : null}
            {step === 2 ? (
              <>
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
                    JPG, PNG or WebP. Images are compressed before upload. You
                    can add more in several batches.
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
                        onClick={() => {
                          setFiles([]);
                          setThumbnailIndex(null);
                        }}
                        className="text-sm text-white/55 hover:text-white"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid max-h-[34rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                      {previews.map(({ file, url }, index) => (
                        <figure
                          key={`${file.name}-${index}`}
                          className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-black/30 ${thumbnailIndex === index ? "border-[#f0c878]" : "border-transparent"}`}
                        >
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setThumbnailIndex(index)}
                            className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c878]"
                            aria-label={`Use ${file.name} as the album thumbnail`}
                          />
                          {thumbnailIndex === index && (
                            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#f0c878] px-2.5 py-1 text-xs font-semibold text-[#211811] shadow-lg">
                              <Check size={13} /> Thumbnail
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setFiles((current) =>
                                current.filter((_, i) => i !== index),
                              );
                              setThumbnailIndex((current) => {
                                if (current === null) return null;
                                if (current === index)
                                  return files.length > 1 ? 0 : null;
                                return current > index ? current - 1 : current;
                              });
                            }}
                            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label={`Remove ${file.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </figure>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-white/45">
                      Tap a photograph to use it as the album thumbnail.
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
            {step === 3 ? (
              <div className="p-5 sm:p-8">
                <h2 className="text-2xl font-semibold">Ready to publish</h2>
                <dl className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 px-5">
                  <div className="flex justify-between gap-4 py-4">
                    <dt className="text-white/45">Album</dt>
                    <dd className="text-right font-medium">{eventName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <dt className="text-white/45">Thumbnail</dt>
                    <dd className="font-medium">
                      {thumbnailIndex === null
                        ? "Not selected"
                        : `Photograph ${thumbnailIndex + 1}`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-4">
                    <dt className="text-white/45">Date</dt>
                    <dd className="font-medium">{eventDate}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-4">
                    <dt className="text-white/45">Photographs</dt>
                    <dd className="font-medium">{files.length}</dd>
                  </div>
                </dl>
                <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {previews.slice(0, 12).map(({ url, file }) => (
                    <img
                      key={url}
                      src={url}
                      alt={file.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
          <aside className="h-fit rounded-3xl border border-white/10 bg-[#211811]/90 p-5 sm:p-7">
            <h2 className="text-xl font-semibold">
              {step === 1
                ? "Album details"
                : step === 2
                  ? "Select photographs"
                  : "Final check"}
            </h2>
            <div className="mt-6 flex gap-3 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-white/50">
              <Info className="mt-0.5 shrink-0 text-[#f0c878]" size={18} />
              <p>
                Use the same event name and date when adding photographs to an
                existing album.
              </p>
            </div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-white/65"
              >
                <ArrowLeft size={17} />
                Back
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                disabled={
                  step === 1
                    ? !eventName.trim() || !eventDate
                    : !files.length || thumbnailIndex === null
                }
                onClick={() => setStep((value) => value + 1)}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-40"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                disabled={isUploading || publish.isPending}
                onClick={() => void submit()}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-50"
              >
                <Upload size={18} />
                {isUploading
                  ? "Uploading photographs..."
                  : publish.isPending
                    ? "Publishing..."
                    : "Publish album"}
              </button>
            )}
          </aside>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
