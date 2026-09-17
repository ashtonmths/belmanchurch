"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
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
  Toggle,
  errorMessage,
} from "~/components/admin/ui";
import type { HeroTint } from "~/lib/site-content";
import { api } from "~/trpc/react";

const SWATCHES = [
  { name: "Dark", color: "#16110C" },
  { name: "Gold", color: "#EAC696", hint: "Same as the Donate button" },
  { name: "Cream", color: "#FBF7F0" },
  { name: "Brown", color: "#765827" },
];

export default function CarouselAdmin() {
  const utils = api.useUtils();
  const slides = api.carousel.adminList.useQuery();
  const refresh = () => utils.carousel.adminList.invalidate();

  const create = api.carousel.create.useMutation({ onSuccess: refresh });
  const update = api.carousel.update.useMutation({ onSuccess: refresh });
  const move = api.carousel.move.useMutation({ onSuccess: refresh });
  const remove = api.carousel.delete.useMutation({ onSuccess: refresh });

  const [image, setImage] = useState<string[]>([]);
  const [title, setTitle] = useState("");

  async function add() {
    if (!image[0]) return toast.warning("Upload an image first");
    try {
      await create.mutateAsync({ imageUrl: image[0], title: title || undefined });
      setImage([]);
      setTitle("");
      toast.success("Slide added");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Homepage carousel"
        description="The photos that rotate behind the heading at the top of the homepage. Wide landscape photos (at least 1600 px across) look best."
      />

      <TintEditor previewImage={slides.data?.find((s) => s.active)?.imageUrl ?? "/bg/home.jpg"} />

      <Card className="mb-8">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">Add a slide</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <ImageUploader value={image} onChange={setImage} folder="carousel" label="Upload slide photo" />
          <div className="space-y-4">
            <Field
              label="What the photo shows (optional)"
              hint="Read aloud to visitors who use screen readers. It is not shown on the page."
            >
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. The church at Christmas" />
            </Field>
            <Button onClick={add} loading={create.isPending} disabled={!image[0]}>
              Add to carousel
            </Button>
          </div>
        </div>
      </Card>

      {slides.isLoading ? (
        <Spinner />
      ) : !slides.data?.length ? (
        <EmptyState>No slides yet. The homepage shows the default church photo until you add one.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {slides.data.map((slide, i) => (
            <li key={slide.id}>
              <Card className="flex flex-col gap-5 md:flex-row md:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt=""
                  className={`aspect-video w-full rounded-xl object-cover md:w-56 ${slide.active ? "" : "opacity-40 grayscale"}`}
                />
                <SlideDescription
                  key={`${slide.id}-${slide.title}`}
                  title={slide.title ?? ""}
                  saving={update.isPending}
                  onSave={(t) =>
                    update
                      .mutateAsync({ id: slide.id, title: t || null })
                      .then(() => toast.success("Saved"))
                      .catch((err: unknown) => toast.error(errorMessage(err)))
                  }
                />
                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                  <Toggle
                    checked={slide.active}
                    label={slide.active ? "Showing" : "Hidden"}
                    onChange={(active) => update.mutate({ id: slide.id, active })}
                  />
                  <span className="flex">
                    <Button variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move.mutate({ id: slide.id, direction: "up" })}>
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label="Move down"
                      disabled={i === slides.data.length - 1}
                      onClick={() => move.mutate({ id: slide.id, direction: "down" })}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </span>
                  <ConfirmButton onConfirm={() => remove.mutateAsync({ id: slide.id })} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TintEditor({ previewImage }: { previewImage: string }) {
  const utils = api.useUtils();
  const query = api.content.get.useQuery({ key: "heroTint" });
  const save = api.content.set.useMutation({
    onSuccess: () => utils.content.get.invalidate({ key: "heroTint" }),
  });
  const [tint, setTint] = useState<HeroTint | null>(null);

  useEffect(() => {
    if (query.data) setTint(query.data as HeroTint);
  }, [query.data]);

  if (!tint) return null;

  return (
    <Card className="mb-8">
      <h2 className="font-serif text-2xl font-semibold text-ink">Photo tint</h2>
      <p className="mt-1 text-sm text-textcolor/70">
        A colour wash over every carousel photo. Pick a colour and slide to make it stronger or lighter.
      </p>
      <div className="mt-5 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="relative isolate aspect-video overflow-hidden rounded-2xl bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ backgroundColor: tint.color, opacity: tint.strength / 100 }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-ink" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
          <p className="absolute bottom-5 left-5 font-serif text-3xl font-semibold leading-none text-white drop-shadow-lg">
            St. Joseph Church
            <span className="block italic text-primary">Belman</span>
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <span className="mb-2 block text-sm font-semibold text-ink">Colour</span>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((s) => (
                <button
                  key={s.color}
                  type="button"
                  title={s.hint ?? s.name}
                  aria-pressed={tint.color.toLowerCase() === s.color.toLowerCase()}
                  onClick={() => setTint({ ...tint, color: s.color })}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    tint.color.toLowerCase() === s.color.toLowerCase()
                      ? "border-ink bg-ink text-cream"
                      : "border-accent/20 bg-white text-ink hover:border-accent"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
                  {s.name}
                </button>
              ))}
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-accent/20 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-accent">
                <input
                  type="color"
                  value={tint.color}
                  onChange={(e) => setTint({ ...tint, color: e.target.value })}
                  className="h-4 w-4 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
                Custom
              </label>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-semibold text-ink">
              Strength <span className="font-normal text-textcolor/70">{tint.strength}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={85}
              step={5}
              value={tint.strength}
              onChange={(e) => setTint({ ...tint, strength: Number(e.target.value) })}
              className="w-full accent-[#765827]"
            />
            <span className="mt-1 flex justify-between text-xs text-textcolor/60">
              <span>None</span>
              <span>Strong</span>
            </span>
          </label>

          <Button
            loading={save.isPending}
            onClick={() =>
              save
                .mutateAsync({ key: "heroTint", value: tint })
                .then(() => toast.success("Tint saved. The homepage is updated."))
                .catch((err: unknown) => toast.error(errorMessage(err)))
            }
          >
            Save tint
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SlideDescription({
  title: initial,
  saving,
  onSave,
}: {
  title: string;
  saving: boolean;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(initial);
  return (
    <div className="flex-1 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What the photo shows (for screen readers)"
        maxLength={120}
      />
      {title !== initial && (
        <Button variant="secondary" loading={saving} onClick={() => onSave(title)}>
          Save
        </Button>
      )}
    </div>
  );
}
