/* eslint-disable @next/next/no-img-element */
"use client";
import imageCompression from "browser-image-compression";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ImagePlus,
  Info,
  MapPin,
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

const COMPRESSION_THRESHOLD_BYTES = 5000 * 1024;
const COMPRESSED_PHOTO_SIZE_MB = 300 / 1024;

export default function AdminGallery() {
  const utils = api.useUtils();
  const [files, setFiles] = useState<File[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [linkedEventId, setLinkedEventId] = useState<string | null>(null);
  const [pendingEventsSkipped, setPendingEventsSkipped] = useState(false);
  const [thumbnailIndex, setThumbnailIndex] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );
  const { uploadImages, isUploading } = useCloudinaryUpload();
  const { data: pendingEvents = [], isLoading: checkingPendingEvents } =
    api.gallery.getPendingEvents.useQuery();
  const publish = api.gallery.uploadGallery.useMutation({
    onSuccess: ({ eventCreated }) => {
      toast.success(
        eventCreated
          ? "Gallery published and event added"
          : "Gallery published",
      );
      setFiles([]);
      setEventName("");
      setEventDate("");
      setLinkedEventId(null);
      setPendingEventsSkipped(false);
      setThumbnailIndex(null);
      setStep(1);
      void utils.gallery.getPendingEvents.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const addFiles = async (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length + next.length > 500) {
      toast.error("A gallery can contain up to 500 photographs");
      return;
    }
    const id = toast.loading(`Preparing ${next.length} photographs…`);
    try {
      const compressed = await Promise.all(
        next.map((file) =>
          file.size > COMPRESSION_THRESHOLD_BYTES
            ? imageCompression(file, {
                maxSizeMB: COMPRESSED_PHOTO_SIZE_MB,
                maxWidthOrHeight: 2000,
                maxIteration: 20,
                useWebWorker: true,
              })
            : Promise.resolve(file),
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
        eventId: linkedEventId ?? undefined,
        images: urls,
        thumbnailUrl,
      });
    } catch {
      toast.error("Upload did not complete. Please try again.");
    }
  };

  const choosePendingEvent = (event: (typeof pendingEvents)[number]) => {
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(event.date));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      dateParts.find((item) => item.type === type)?.value ?? "";
    setEventName(event.name);
    setEventDate(`${part("year")}-${part("month")}-${part("day")}`);
    setLinkedEventId(event.id);
    setPendingEventsSkipped(true);
    setStep(2);
  };

  if (checkingPendingEvents) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER", "PHOTOGRAPHER"]}>
        <PageShell
          admin
          title="Gallery"
          description="Prepare and publish a complete event album from one place."
        >
          <div className="min-h-48 animate-pulse rounded-3xl border border-white/10 bg-[#211811]/90" />
        </PageShell>
      </ProtectedRoute>
    );
  }

  if (!pendingEventsSkipped && pendingEvents.length > 0) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER", "PHOTOGRAPHER"]}>
        <PageShell
          admin
          title="Photographs pending"
          description="These parish events do not have a gallery album yet."
        >
          <ThemedToast />
          <section className="rounded-3xl border border-white/10 bg-[#211811]/95 p-5 shadow-2xl sm:p-8">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Upload photographs for an event?
                </h2>
                <p className="mt-2 max-w-2xl leading-7 text-white/50">
                  Choosing an event fills in its name and date and takes you
                  directly to photograph selection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingEventsSkipped(true)}
                className="min-h-11 shrink-0 rounded-full border border-white/15 px-5 text-sm font-semibold text-white/65 transition hover:border-white/30 hover:text-white"
              >
                Skip for now
              </button>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {pendingEvents.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
                >
                  <h3 className="text-xl font-semibold text-white">
                    {event.name}
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-white/50">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#f0c878]" />
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#f0c878]" />
                      {event.venue}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => choosePendingEvent(event)}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] transition hover:bg-[#e7bb64]"
                  >
                    Upload this event
                  </button>
                </article>
              ))}
            </div>
          </section>
        </PageShell>
      </ProtectedRoute>
    );
  }

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
                      onChange={(e) => {
                        setLinkedEventId(null);
                        setEventName(
                          e.target.value.replace(/\b\w/g, (c) =>
                            c.toUpperCase(),
                          ),
                        );
                      }}
                      placeholder="Parish feast"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
                    />
                  </label>
                  <label className="text-sm text-white/55">
                    Event date
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => {
                        setLinkedEventId(null);
                        setEventDate(e.target.value);
                      }}
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
                    JPG, PNG or WebP. Files above 5,000 KB are compressed to
                    about 300 KB; smaller files keep their original quality.
                  </span>
                </label>
                {previews.length ? (
                  <div className="p-4 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-white/55">
                        {files.length} of 500 photographs
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
