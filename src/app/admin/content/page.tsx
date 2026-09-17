"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ImageUploader from "~/components/admin/ImageUploader";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Spinner,
  TextArea,
  errorMessage,
} from "~/components/admin/ui";
import { CONTENT, type ContentKey, type InfoItem, type ServiceItem } from "~/lib/site-content";
import { api } from "~/trpc/react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const TABS: { key: ContentKey; hint: string }[] = [
  { key: "massTimings", hint: "Shown on the homepage, in the “Next Mass” card and to Google." },
  { key: "otherServices", hint: "Catechism, the shrine and other regular services." },
  { key: "officeHours", hint: "When the parish office is open." },
  { key: "associations", hint: "Parish associations and groups." },
  { key: "commissions", hint: "Parish commissions. Don't add personal names or phone numbers." },
  { key: "institutions", hint: "Schools and the convent." },
  { key: "tourism", hint: "Places to visit near Belman." },
];

const isServiceKey = (k: ContentKey) => k === "massTimings" || k === "otherServices" || k === "officeHours";

export default function ContentAdmin() {
  const [tab, setTab] = useState<ContentKey>("massTimings");
  const hint = TABS.find((t) => t.key === tab)?.hint;

  return (
    <div>
      <PageHeader
        title="Page content"
        description="Edit the text shown around the website. Changes appear as soon as you save."
      />
      <div role="tablist" className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ key }) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key ? "bg-ink text-cream" : "border border-accent/20 bg-white text-ink hover:border-accent"
            }`}
          >
            {CONTENT[key].label}
          </button>
        ))}
      </div>
      {hint && <p className="mb-5 text-sm text-textcolor/70">{hint}</p>}
      <Editor key={tab} contentKey={tab} />
    </div>
  );
}

function Editor({ contentKey }: { contentKey: ContentKey }) {
  const utils = api.useUtils();
  const query = api.content.get.useQuery({ key: contentKey });
  const save = api.content.set.useMutation({
    onSuccess: () => utils.content.get.invalidate({ key: contentKey }),
  });
  const reset = api.content.reset.useMutation({
    onSuccess: () => utils.content.get.invalidate({ key: contentKey }),
  });

  const [value, setValue] = useState<unknown>(null);
  useEffect(() => {
    if (query.data !== undefined) setValue(structuredClone(query.data));
  }, [query.data]);

  if (query.isLoading || value === null) return <Spinner />;

  async function onSave() {
    try {
      await save.mutateAsync({ key: contentKey, value });
      toast.success("Saved. The website is updated.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const single = contentKey === "officeHours";

  return (
    <div>
      {isServiceKey(contentKey) ? (
        single ? (
          <ServiceEditor item={value as ServiceItem} onChange={setValue} />
        ) : (
          <ListEditor<ServiceItem>
            items={value as ServiceItem[]}
            onChange={setValue}
            blank={{ label: "", times: [""], days: [] }}
            addLabel="Add service"
            render={(item, update) => <ServiceEditor item={item} onChange={update} />}
          />
        )
      ) : (
        <ListEditor<InfoItem>
          items={value as InfoItem[]}
          onChange={setValue}
          blank={{ title: "", body: "" }}
          addLabel="Add item"
          render={(item, update) => (
            <InfoEditor item={item} onChange={update} withKonkani={contentKey === "commissions"} contentKey={contentKey} />
          )}
        />
      )}

      <div className="sticky bottom-4 mt-8 flex flex-wrap gap-2 rounded-2xl border border-accent/10 bg-white/95 p-3 shadow-lg backdrop-blur">
        <Button onClick={onSave} loading={save.isPending}>
          Save changes
        </Button>
        <Button
          variant="ghost"
          loading={reset.isPending}
          onClick={() => {
            if (confirm("Discard all saved edits for this section and restore the original text?")) {
              reset.mutate({ key: contentKey }, { onSuccess: () => toast.info("Restored the original text") });
            }
          }}
        >
          <RotateCcw size={14} /> Restore original
        </Button>
      </div>
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  blank,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  blank: T;
  addLabel: string;
  render: (item: T, update: (item: T) => void) => React.ReactNode;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <Card key={i} className="relative">
          <div className="absolute right-3 top-3 flex">
            <Button variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp size={16} />
            </Button>
            <Button variant="ghost" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown size={16} />
            </Button>
            <Button variant="ghost" aria-label="Remove" className="!text-red-700" onClick={() => onChange(items.filter((_, k) => k !== i))}>
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="pr-32">{render(item, (next) => onChange(items.map((it, k) => (k === i ? next : it))))}</div>
        </Card>
      ))}
      <Button variant="secondary" onClick={() => onChange([...items, structuredClone(blank)])}>
        <Plus size={16} /> {addLabel}
      </Button>
    </div>
  );
}

function ServiceEditor({ item, onChange }: { item: ServiceItem; onChange: (item: ServiceItem) => void }) {
  const days = item.days ?? [];
  return (
    <div className="grid gap-4">
      <Field label="Name">
        <Input value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} placeholder="e.g. Sunday Mass" />
      </Field>
      <Field label="Times" hint="One per box, like 7:30 AM or 9:15 AM to 10:30 AM">
        <span className="flex flex-wrap gap-2">
          {item.times.map((t, i) => (
            <span key={i} className="flex items-center gap-1">
              <Input
                className="!w-44"
                value={t}
                onChange={(e) => onChange({ ...item, times: item.times.map((x, k) => (k === i ? e.target.value : x)) })}
              />
              {item.times.length > 1 && (
                <Button variant="ghost" aria-label="Remove time" onClick={() => onChange({ ...item, times: item.times.filter((_, k) => k !== i) })}>
                  <Trash2 size={14} />
                </Button>
              )}
            </span>
          ))}
          {item.times.length < 6 && (
            <Button variant="secondary" onClick={() => onChange({ ...item, times: [...item.times, ""] })}>
              <Plus size={14} /> Time
            </Button>
          )}
        </span>
      </Field>
      <Field label="Note (optional)">
        <Input value={item.note ?? ""} onChange={(e) => onChange({ ...item, note: e.target.value || undefined })} />
      </Field>
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-ink">Days</span>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const on = days.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...item, days: on ? days.filter((x) => x !== d) : [...days, d] })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  on ? "bg-accent text-cream" : "border border-accent/20 bg-white text-ink"
                }`}
              >
                {d.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoEditor({
  item,
  onChange,
  withKonkani,
  contentKey,
}: {
  item: InfoItem;
  onChange: (item: InfoItem) => void;
  withKonkani: boolean;
  contentKey: ContentKey;
}) {
  const withImage = contentKey === "institutions" || contentKey === "tourism";
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <Field label="Title">
          <Input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })} />
        </Field>
        <Field label="Badge (optional)" hint="e.g. Since 1989">
          <Input value={item.badge ?? ""} onChange={(e) => onChange({ ...item, badge: e.target.value || undefined })} />
        </Field>
      </div>
      <Field label="Description (English)">
        <TextArea rows={4} value={item.body} onChange={(e) => onChange({ ...item, body: e.target.value })} />
      </Field>
      {withKonkani && (
        <Field label="Konkani (optional)" hint="Paste Konkani text here. Text copied from the old website keeps its original Kannada font.">
          <TextArea
            rows={4}
            value={item.bodyKonkani ?? ""}
            onChange={(e) => onChange({ ...item, bodyKonkani: e.target.value || undefined })}
          />
        </Field>
      )}
      {withImage && (
        <Field label="Photo (optional)">
          <span className="block">
            <ImageUploader
              value={item.imageUrl ? [item.imageUrl] : []}
              onChange={(urls) => onChange({ ...item, imageUrl: urls[0] })}
              folder={contentKey}
            />
          </span>
        </Field>
      )}
      {withImage && item.imageUrl && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Photo credit (optional)" hint="Needed for photos you did not take, e.g. from Wikimedia Commons">
            <Input
              value={item.imageCredit ?? ""}
              onChange={(e) => onChange({ ...item, imageCredit: e.target.value || undefined })}
            />
          </Field>
          <Field label="Credit link (optional)">
            <Input
              value={item.imageCreditUrl ?? ""}
              onChange={(e) => onChange({ ...item, imageCreditUrl: e.target.value || undefined })}
            />
          </Field>
        </div>
      )}
    </div>
  );
}
