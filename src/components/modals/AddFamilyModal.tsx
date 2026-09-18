"use client";
import { useState } from "react";
import {
  AdminDialog,
  adminInput,
  DialogActions,
} from "~/components/admin/AdminDialog";
import { api } from "~/trpc/react";
export default function AddFamilyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [headId, setHeadId] = useState("");
  const { data: parishoners } = api.parishoner.getAllParishoners.useQuery();
  const add = api.family.addFamily.useMutation({
    onSuccess: () => window.location.reload(),
  });
  return (
    <AdminDialog
      title="Add family"
      onClose={onClose}
      actions={
        <DialogActions
          onClose={onClose}
          onSave={() => add.mutate({ name, headId })}
          disabled={!name || add.isPending}
        />
      }
    >
      <label className="block text-sm text-white/55">
        Family name
        <input
          className={adminInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block text-sm text-white/55">
        Family head
        <select
          className={adminInput}
          value={headId}
          onChange={(e) => setHeadId(e.target.value)}
        >
          <option value="">Select parishioner</option>
          {parishoners?.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
    </AdminDialog>
  );
}
