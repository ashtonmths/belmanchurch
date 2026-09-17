"use client";

import dayjs from "dayjs";
import { Pencil, Pin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
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
  Toggle,
  errorMessage,
} from "~/components/admin/ui";
import { api } from "~/trpc/react";

type Draft = {
  id?: string;
  title: string;
  body: string;
  link: string;
  pinned: boolean;
  active: boolean;
  expiresAt: string; // yyyy-mm-dd
};

const empty: Draft = { title: "", body: "", link: "", pinned: false, active: true, expiresAt: "" };

export default function NoticesAdmin() {
  const utils = api.useUtils();
  const list = api.notice.adminList.useQuery();
  const refresh = () => Promise.all([utils.notice.adminList.invalidate(), utils.notice.listActive.invalidate()]);
  const create = api.notice.create.useMutation({ onSuccess: refresh });
  const update = api.notice.update.useMutation({ onSuccess: refresh });
  const remove = api.notice.delete.useMutation({ onSuccess: refresh });

  const [draft, setDraft] = useState<Draft | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function save() {
    if (!draft) return;
    if (draft.title.trim().length < 3) return toast.warning("Add a title");
    if (draft.body.trim().length < 3) return toast.warning("Add the message");
    const payload = {
      title: draft.title.trim(),
      body: draft.body.trim(),
      link: draft.link.trim() || null,
      pinned: draft.pinned,
      active: draft.active,
      // End of the chosen day, so the notice shows for all of that day.
      expiresAt: draft.expiresAt ? dayjs(draft.expiresAt).endOf("day").toISOString() : null,
    };
    try {
      if (draft.id) await update.mutateAsync({ id: draft.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(draft.id ? "Notification updated" : "Notification posted");
      setDraft(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const now = new Date();

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Short announcements shown on the homepage and the Notices page, such as Mass changes, meetings and reminders."
        actions={
          !draft && (
            <Button onClick={() => setDraft({ ...empty })}>
              <Plus size={16} /> New notification
            </Button>
          )
        }
      />

      {draft && (
        <Card className="mb-8">
          <div className="grid gap-5">
            <Field label="Title">
              <Input value={draft.title} onChange={(e) => set("title", e.target.value)} maxLength={160} />
            </Field>
            <Field label="Message">
              <TextArea rows={5} value={draft.body} onChange={(e) => set("body", e.target.value)} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Link (optional)" hint="A page on this site like /events, or a full https:// address">
                <Input value={draft.link} onChange={(e) => set("link", e.target.value)} />
              </Field>
              <Field label="Hide automatically after (optional)">
                <Input type="date" value={draft.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={draft.pinned} onChange={(v) => set("pinned", v)} label="Pin to the top" />
              <Toggle checked={draft.active} onChange={(v) => set("active", v)} label="Published" />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={save} loading={create.isPending || update.isPending}>
              {draft.id ? "Save changes" : "Post notification"}
            </Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {list.isLoading ? (
        <Spinner />
      ) : !list.data?.length ? (
        <EmptyState>No notifications yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {list.data.map((n) => {
            const expired = n.expiresAt && n.expiresAt < now;
            const live = n.active && !expired;
            return (
              <li key={n.id}>
                <Card className="!p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold text-ink">
                        {n.pinned && <Pin size={14} className="text-accent" aria-label="Pinned" />}
                        {n.title}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            live ? "bg-green-100 text-green-800" : "bg-accent/10 text-textcolor/70"
                          }`}
                        >
                          {live ? "Live" : expired ? "Expired" : "Hidden"}
                        </span>
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-textcolor/80">{n.body}</p>
                      <p className="mt-2 text-xs text-textcolor/60">
                        Posted {dayjs(n.publishedAt).format("D MMM YYYY")}
                        {n.expiresAt && ` · hides after ${dayjs(n.expiresAt).format("D MMM YYYY")}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setDraft({
                            id: n.id,
                            title: n.title,
                            body: n.body,
                            link: n.link ?? "",
                            pinned: n.pinned,
                            active: n.active,
                            expiresAt: n.expiresAt ? dayjs(n.expiresAt).format("YYYY-MM-DD") : "",
                          })
                        }
                      >
                        <Pencil size={14} /> Edit
                      </Button>
                      <ConfirmButton onConfirm={() => remove.mutateAsync({ id: n.id })} />
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
