"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, UserRound } from "lucide-react";
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
  Select,
  Spinner,
  Toggle,
  errorMessage,
} from "~/components/admin/ui";
import { api, type RouterOutputs } from "~/trpc/react";

type Priest = RouterOutputs["priest"]["list"][number];
type Role = Priest["role"];

type Draft = {
  id?: string;
  name: string;
  role: Role;
  period: string;
  image: string[];
  isCurrent: boolean;
};

const ROLE_LABEL: Record<Role, string> = {
  PARISH_PRIEST: "Parish priests",
  ASSISTANT_PRIEST: "Assistant parish priests",
};

export default function PriestsAdmin() {
  const utils = api.useUtils();
  const list = api.priest.list.useQuery();
  const refresh = () => Promise.all([utils.priest.list.invalidate(), utils.priest.current.invalidate()]);
  const create = api.priest.create.useMutation({ onSuccess: refresh });
  const update = api.priest.update.useMutation({ onSuccess: refresh });
  const move = api.priest.move.useMutation({ onSuccess: refresh });
  const remove = api.priest.delete.useMutation({ onSuccess: refresh });

  const [draft, setDraft] = useState<Draft | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function save() {
    if (!draft) return;
    if (draft.name.trim().length < 3) return toast.warning("Add the priest's name");
    if (draft.period.trim().length < 2) return toast.warning("Add the years served, e.g. 2022 to present");
    const payload = {
      name: draft.name.trim(),
      role: draft.role,
      period: draft.period.trim(),
      imageUrl: draft.image[0] ?? null,
      isCurrent: draft.isCurrent,
    };
    try {
      if (draft.id) await update.mutateAsync({ id: draft.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success("Saved");
      setDraft(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const byRole = (role: Role) => (list.data ?? []).filter((p) => p.role === role);

  return (
    <div>
      <PageHeader
        title="Priests"
        description="The parish priests and assistant parish priests shown on the homepage and the History page. Mark whoever is serving now as “current”."
        actions={
          !draft && (
            <Button
              onClick={() =>
                setDraft({ name: "Rev. Fr. ", role: "ASSISTANT_PRIEST", period: "", image: [], isCurrent: true })
              }
            >
              <Plus size={16} /> Add priest
            </Button>
          )
        }
      />

      {draft && (
        <Card className="mb-8">
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <ImageUploader
              value={draft.image}
              onChange={(image) => set("image", image)}
              folder="priests"
              label="Upload photo"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <Input value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />
              </Field>
              <Field label="Role">
                <Select value={draft.role} onChange={(e) => set("role", e.target.value as Role)}>
                  <option value="PARISH_PRIEST">Parish priest</option>
                  <option value="ASSISTANT_PRIEST">Assistant parish priest</option>
                </Select>
              </Field>
              <Field label="Years served" hint="e.g. 2025 to present">
                <Input value={draft.period} onChange={(e) => set("period", e.target.value)} maxLength={60} />
              </Field>
              <div className="flex items-end pb-2">
                <Toggle checked={draft.isCurrent} onChange={(v) => set("isCurrent", v)} label="Serving now (current)" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={save} loading={create.isPending || update.isPending}>
              Save
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
        (["PARISH_PRIEST", "ASSISTANT_PRIEST"] as const).map((role) => {
          const priests = byRole(role);
          return (
            <section key={role} className="mb-10">
              <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">{ROLE_LABEL[role]}</h2>
              {priests.length === 0 ? (
                <EmptyState>None yet.</EmptyState>
              ) : (
                <ul className="divide-y divide-accent/10 overflow-hidden rounded-2xl border border-accent/10 bg-white">
                  {priests.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-4 p-3">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/30 text-accent">
                          <UserRound size={22} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">
                          {p.name}
                          {p.isCurrent && (
                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-textcolor/70">{p.period}</p>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <Button variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move.mutate({ id: p.id, direction: "up" })}>
                          <ArrowUp size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label="Move down"
                          disabled={i === priests.length - 1}
                          onClick={() => move.mutate({ id: p.id, direction: "down" })}
                        >
                          <ArrowDown size={16} />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setDraft({
                              id: p.id,
                              name: p.name,
                              role: p.role,
                              period: p.period,
                              image: p.imageUrl ? [p.imageUrl] : [],
                              isCurrent: p.isCurrent,
                            })
                          }
                        >
                          <Pencil size={14} /> Edit
                        </Button>
                        <ConfirmButton onConfirm={() => remove.mutateAsync({ id: p.id })} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
