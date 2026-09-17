"use client";

import dayjs from "dayjs";
import { CalendarDays, MapPin, Pencil, Plus } from "lucide-react";
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
  TextArea,
  errorMessage,
} from "~/components/admin/ui";
import { api, type RouterOutputs } from "~/trpc/react";

type Event = RouterOutputs["event"]["list"]["upcoming"][number];

type Draft = {
  id?: string;
  name: string;
  date: string; // datetime-local value
  venue: string;
  info: string;
  images: string[];
};

const empty: Draft = { name: "", date: "", venue: "St. Joseph Church, Belman", info: "", images: [] };

function toDraft(e: Event): Draft {
  const images = e.images.length ? e.images : e.image ? [e.image] : [];
  return {
    id: e.id,
    name: e.name,
    date: dayjs(e.date).format("YYYY-MM-DDTHH:mm"),
    venue: e.venue,
    info: e.info ?? "",
    images,
  };
}

export default function EventsAdmin() {
  const utils = api.useUtils();
  const list = api.event.list.useQuery();
  const refresh = () => utils.event.list.invalidate();
  const create = api.event.create.useMutation({ onSuccess: refresh });
  const update = api.event.update.useMutation({ onSuccess: refresh });
  const remove = api.event.delete.useMutation({ onSuccess: refresh });

  const [draft, setDraft] = useState<Draft | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function save() {
    if (!draft) return;
    if (draft.name.trim().length < 3) return toast.warning("Give the event a name");
    if (!draft.date) return toast.warning("Choose a date and time");
    if (draft.venue.trim().length < 2) return toast.warning("Add a venue");

    const payload = {
      name: draft.name.trim(),
      date: new Date(draft.date).toISOString(),
      venue: draft.venue.trim(),
      info: draft.info.trim() || null,
      image: draft.images[0] ?? "",
      images: draft.images,
    };
    try {
      if (draft.id) await update.mutateAsync({ id: draft.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(draft.id ? "Event updated" : "Event published");
      setDraft(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const renderList = (events: Event[], heading: string) => (
    <section className="mb-10">
      <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">{heading}</h2>
      {events.length === 0 ? (
        <EmptyState>Nothing here yet.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {events.map((e) => {
            const cover = e.images[0] ?? e.image;
            return (
              <li key={e.id}>
                <Card className="flex h-full gap-4 !p-4">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-24 w-32 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-primary/30 text-accent">
                      <CalendarDays />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{e.name}</p>
                    <p className="mt-1 text-sm text-textcolor/80">
                      {dayjs(e.date).format("ddd D MMM YYYY, h:mm A")}
                    </p>
                    <p className="flex items-center gap-1 truncate text-sm text-textcolor/70">
                      <MapPin size={14} aria-hidden /> {e.venue}
                    </p>
                    <p className="mt-1 text-xs text-textcolor/60">{e.images.length} photo(s)</p>
                    <div className="mt-2 flex gap-1">
                      <Button variant="secondary" onClick={() => setDraft(toDraft(e))}>
                        <Pencil size={14} /> Edit
                      </Button>
                      <ConfirmButton onConfirm={() => remove.mutateAsync({ id: e.id })} />
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  return (
    <div>
      <PageHeader
        title="Events"
        description="Everything you add here appears on the Events page, and upcoming events also show on the homepage."
        actions={
          !draft && (
            <Button onClick={() => setDraft({ ...empty })}>
              <Plus size={16} /> New event
            </Button>
          )
        }
      />

      {draft && (
        <Card className="mb-10">
          <h2 className="mb-5 font-serif text-2xl font-semibold text-ink">
            {draft.id ? "Edit event" : "New event"}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Event name">
              <Input value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={160} />
            </Field>
            <Field label="Date and time">
              <Input type="datetime-local" value={draft.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Venue">
              <Input value={draft.venue} onChange={(e) => set("venue", e.target.value)} maxLength={160} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Details" hint="Programme, celebrant, timings, anything visitors should know.">
                <TextArea rows={6} value={draft.info} onChange={(e) => set("info", e.target.value)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Photos" hint="The first photo is used as the cover. Use the arrows to reorder.">
                <span className="block">
                  <ImageUploader
                    multiple
                    value={draft.images}
                    onChange={(images) => set("images", images)}
                    folder={`events-${draft.name || "new"}`}
                    label="Upload event photos"
                  />
                </span>
              </Field>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={save} loading={create.isPending || update.isPending}>
              {draft.id ? "Save changes" : "Publish event"}
            </Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {list.isLoading ? (
        <Spinner />
      ) : (
        <>
          {renderList(list.data?.upcoming ?? [], "Upcoming")}
          {renderList(list.data?.past ?? [], "Past")}
        </>
      )}
    </div>
  );
}
