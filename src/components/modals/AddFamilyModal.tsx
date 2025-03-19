"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function AddFamilyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [headId, setHeadId] = useState("");

  const { data: parishoners } = api.family.getAllParishoners.useQuery();
  const addFamily = api.family.addFamily.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleSave = () => {
    addFamily.mutate(
      { name, headId },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6">
        <h2 className="text-lg font-bold">Add Family</h2>

        <label className="mt-2 block">
          Family Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="mt-2 block">
          Family Head:
          <select
            value={headId}
            onChange={(e) => setHeadId(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">Select Head</option>
            {parishoners?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="rounded bg-gray-300 px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-primary px-4 py-2 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
