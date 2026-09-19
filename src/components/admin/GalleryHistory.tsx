/* eslint-disable @next/next/no-img-element */
"use client";

import { CalendarDays, Check, Images, Pencil, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/trpc/react";

function inputDate(value: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export default function GalleryHistory() {
  const utils = api.useUtils();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { data: albums = [], isLoading } =
    api.gallery.getAdminAlbums.useQuery();
  const { data: images = [], isFetching: loadingImages } =
    api.gallery.getImagesByID.useQuery(
      { id: selectedId ?? "" },
      { enabled: Boolean(selectedId), staleTime: 60_000 },
    );
  const updateAlbum = api.gallery.updateAlbum.useMutation({
    onSuccess: async (_, variables) => {
      utils.gallery.getAdminAlbums.setData(undefined, (current) =>
        current?.map((album) =>
          album.id === variables.id
            ? {
                ...album,
                eventName: variables.eventName,
                eventDate: new Date(variables.eventDate),
                thumbnailUrl: variables.thumbnailUrl,
              }
            : album,
        ),
      );
      utils.gallery.getFolders.setData(undefined, (current) =>
        current?.map((album) =>
          album.id === variables.id
            ? {
                ...album,
                eventName: variables.eventName,
                eventDate: new Date(variables.eventDate),
                previewImage: variables.thumbnailUrl,
              }
            : album,
        ),
      );
      toast.success("Album updated");
      await Promise.all([
        utils.gallery.getAdminAlbums.invalidate(),
        utils.gallery.getFolders.invalidate(),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  const edit = (album: (typeof albums)[number]) => {
    setSelectedId(album.id);
    setName(album.eventName);
    setDate(inputDate(album.eventDate));
    setThumbnailUrl(album.thumbnailUrl ?? "");
  };

  if (isLoading) {
    return (
      <div className="min-h-64 animate-pulse rounded-3xl border border-white/10 bg-[#211811]/90" />
    );
  }

  if (selectedId) {
    const album = albums.find((item) => item.id === selectedId);
    return (
      <div className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-[#211811]/95 p-5 sm:p-7">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-sm font-medium text-[#f0c878]"
          >
            Back to all albums
          </button>
          <h2 className="mt-5 text-2xl font-semibold text-white">Edit album</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Changes also update the linked event.
          </p>
          <div className="mt-6 space-y-5">
            <label className="block text-sm text-white/55">
              Album name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
              />
            </label>
            <label className="block text-sm text-white/55">
              Event date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#f0c878]"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={
              !name.trim() || !date || !thumbnailUrl || updateAlbum.isPending
            }
            onClick={() =>
              updateAlbum.mutate({
                id: selectedId,
                eventName: name.trim(),
                eventDate: date,
                thumbnailUrl,
              })
            }
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811] disabled:opacity-40"
          >
            <Save size={17} />
            {updateAlbum.isPending ? "Saving..." : "Save changes"}
          </button>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-[#211811]/95 p-4 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Choose thumbnail
              </h2>
              <p className="mt-1 text-sm text-white/45">
                {album?.imageCount ?? images.length} photographs
              </p>
            </div>
            <p className="text-sm text-white/45">
              Tap any photograph to select it
            </p>
          </div>
          {loadingImages ? (
            <p className="py-16 text-center text-white/45">
              Loading photographs...
            </p>
          ) : (
            <div className="mt-5 grid max-h-[70vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setThumbnailUrl(image.url)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-black/30 ${thumbnailUrl === image.url ? "border-[#f0c878]" : "border-transparent"}`}
                >
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {thumbnailUrl === image.url && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#f0c878] px-2.5 py-1 text-xs font-semibold text-[#211811]">
                      <Check size={13} /> Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return albums.length ? (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album) => (
        <article
          key={album.id}
          className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/95"
        >
          <div className="aspect-[16/10] bg-black/25">
            {album.thumbnailUrl ? (
              <img
                src={album.thumbnailUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full place-items-center text-white/20">
                <Images size={36} />
              </span>
            )}
          </div>
          <div className="p-5">
            <h2 className="line-clamp-2 text-lg font-semibold text-white">
              {album.eventName}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/45">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} />
                {new Date(album.eventDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })}
              </span>
              <span className="flex items-center gap-2">
                <Images size={15} /> {album.imageCount}
              </span>
            </div>
            <button
              type="button"
              onClick={() => edit(album)}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 font-medium text-white/70 transition hover:border-[#f0c878]/50 hover:text-[#f0c878]"
            >
              <Pencil size={16} /> Edit album
            </button>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <p className="rounded-3xl border border-white/10 bg-[#211811]/95 p-8 text-white/55">
      No gallery albums have been published yet.
    </p>
  );
}
