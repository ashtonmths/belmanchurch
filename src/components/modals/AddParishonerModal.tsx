"use client";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function AddParishonerModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [wardId, setWardId] = useState("");
  const [familyId, setFamilyId] = useState("");

  const { data: wards } = api.ward.getAllWards.useQuery();
  const { data: families } = api.family.getAllFamilies.useQuery();
  const addParishoner = api.parishoner.addParishoner.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleSave = () => {
    addParishoner.mutate(
      { name, mobile, wardId, familyId },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6">
        <h2 className="text-lg font-bold">Add Parishoner</h2>

        <label className="mt-2 block">
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="mt-2 block">
          Mobile:
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="mt-2 block">
          Ward:
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">Select Ward</option>
            {wards?.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-2 block">
          Family:
          <select
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">Select Family</option>
            {families?.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
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
