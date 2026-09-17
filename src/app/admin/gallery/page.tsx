"use client";

import dayjs from "dayjs";
import { ChevronLeft, ImageIcon, Images } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ImageUploader from "~/components/admin/ImageUploader";
import {
  Button,
  Card,
  ConfirmButton,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Spinner,
  errorMessage,
} from "~/components/admin/ui";
import { api } from "~/trpc/react";

const TIPS = [
  "To add photos to an existing album, use exactly the same event name and date.",
  "Capitalise the first letter of every word in the event name.",
  "Upload up to 200 photos per event, and avoid personal posed shots.",
  "Photos are compressed automatically before uploading.",
];

export default function GalleryAdmin() {
  const utils = api.useUtils();
  const folders = api.gallery.getFolders.useQuery();
  const upload = api.gallery.uploadGallery.useMutation({
    onSuccess: () => utils.gallery.getFolders.invalidate(),
  });
  const deleteGallery = api.gallery.deleteGallery.useMutation({
    onSuccess: () => utils.gallery.getFolders.invalidate(),
  });

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

  async function publish() {
    if (!eventName.trim() || !eventDate) return toast.warning("Add the event name and date first");
    if (images.length === 0) return toast.warning("Upload at least one photo");
    try {
      await upload.mutateAsync({ eventName: titleCase(eventName.trim()), eventDate, images });
      toast.success(`${images.length} photo(s) added to the gallery`);
      setImages([]);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (openId) return <AlbumView id={openId} onBack={() => setOpenId(null)} />;

  return (
    <div>
      <PageHeader title="Gallery" description="Photo albums shown on the Gallery page." />

      <Card className="mb-8">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">Upload photos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Event name">
            <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Parish Feast" />
          </Field>
          <Field label="Event date">
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <ImageUploader
            multiple
            value={images}
            onChange={setImages}
            folder={`gallery-${eventName || "album"}-${eventDate}`}
            label="Upload event photos"
          />
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-textcolor/70">
          {TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <Button className="mt-5" onClick={publish} loading={upload.isPending} disabled={images.length === 0}>
          Publish to gallery
        </Button>
      </Card>

      {folders.isLoading ? (
        <Spinner />
      ) : !folders.data?.length ? (
        <EmptyState>No albums yet.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.data.map((f) => (
            <li key={f.id}>
              <Card className="!p-0 overflow-hidden">
                <button type="button" onClick={() => setOpenId(f.id)} className="block w-full text-left">
                  {f.previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.previewImage} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <span className="flex aspect-video items-center justify-center bg-primary/20 text-accent">
                      <ImageIcon />
                    </span>
                  )}
                  <span className="block p-4">
                    <span className="block font-semibold text-ink">{f.eventName}</span>
                    <span className="block text-sm text-textcolor/70">
                      {dayjs(f.eventDate).format("D MMM YYYY")} · {f.imageCount} photos
                    </span>
                  </span>
                </button>
                <div className="flex justify-end border-t border-accent/10 px-2 py-1">
                  <ConfirmButton label="Delete album" onConfirm={() => deleteGallery.mutateAsync({ id: f.id })} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AlbumView({ id, onBack }: { id: string; onBack: () => void }) {
  const utils = api.useUtils();
  const images = api.gallery.getImagesByID.useQuery({ id });
  const remove = api.gallery.deleteImage.useMutation({
    onSuccess: () =>
      Promise.all([utils.gallery.getImagesByID.invalidate({ id }), utils.gallery.getFolders.invalidate()]),
  });

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft size={16} /> All albums
      </Button>
      <PageHeader title="Album photos" description="Remove any photo that shouldn't be public." />
      {images.isLoading ? (
        <Spinner />
      ) : !images.data?.length ? (
        <EmptyState>
          <Images className="mx-auto mb-2 text-accent" /> This album has no photos.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.data.map((img) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-accent/10 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="aspect-square w-full object-cover" />
              <div className="flex justify-center py-1">
                <ConfirmButton label="Remove" onConfirm={() => remove.mutateAsync({ id: img.id })} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
