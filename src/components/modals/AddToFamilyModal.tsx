"use client";
import { useState } from "react";
import {
  AdminDialog,
  adminInput,
  DialogActions,
} from "~/components/admin/AdminDialog";
import { api } from "~/trpc/react";
export default function AddMemberModal({
  familyId,
  onClose,
}: {
  familyId: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const { data: people } = api.parishoner.getAllParishoners.useQuery();
  const add = api.parishoner.assignParishonerToFamily.useMutation({
    onSuccess: () => window.location.reload(),
  });
  const filtered = people?.filter((person) =>
    person.name?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <AdminDialog
      title="Add family member"
      onClose={onClose}
      actions={
        <DialogActions
          onClose={onClose}
          onSave={() => add.mutate({ parishonerId: selected, familyId })}
          label="Add member"
          disabled={!selected || add.isPending}
        />
      }
    >
      <label className="block text-sm text-white/55">
        Find parishioner
        <input
          className={adminInput}
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 p-2">
        {filtered?.map((person) => (
          <button
            type="button"
            key={person.id}
            onClick={() => setSelected(person.id)}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${selected === person.id ? "bg-[#f0c878] text-[#211811]" : "text-white/70 hover:bg-white/[0.06]"}`}
          >
            {person.name}
          </button>
        ))}
      </div>
    </AdminDialog>
  );
}
