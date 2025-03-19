import { useState } from "react";
import { api } from "~/trpc/react";

interface EditWardGurkarModalProps {
  onClose: () => void;
}

export default function EditWardGurkarModal({
  onClose,
}: EditWardGurkarModalProps) {
  const [wardId, setWardId] = useState("");
  const [gurkarId, setGurkarId] = useState("");

  // ✅ Fetch all wards
  const { data: wards } = api.ward.getAllWards.useQuery();
  // ✅ Fetch all parishoners (who can be Gurkars)
  const { data: parishoners } = api.family.getAllParishoners.useQuery();
  const updateWardGurkar = api.ward.updateWardGurkar.useMutation({
    onSuccess: () => {
      window.location.reload(); // 🔄 Refresh to reflect changes
    },
  });

  const handleSave = () => {
    if (!wardId || !gurkarId) return;
    updateWardGurkar.mutate(
      { wardId, gurkarId },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6">
        <h2 className="text-lg font-bold">Edit Ward Gurkar</h2>

        {/* ✅ Select Ward */}
        <label className="mt-2 block">
          Select Ward:
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

        {/* ✅ Select Gurkar */}
        <label className="mt-2 block">
          Select Gurkar:
          <select
            value={gurkarId}
            onChange={(e) => setGurkarId(e.target.value)}
            className="w-full rounded border p-2"
            disabled={!wardId}
          >
            <option value="">Select Parishoner</option>
            {parishoners
              ?.filter((p) => p.ward?.id === wardId) // ✅ Show only ward members
              .map((p) => (
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
            disabled={!wardId || !gurkarId}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
