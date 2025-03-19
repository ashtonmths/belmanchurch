import { useState } from "react";
import { api } from "~/trpc/react";

// ✅ Define the type for member
type Member = {
  id: string;
  name?: string | null;
  mobile?: string;
  ward?: { id: string; name: string } | null;
  familyHead?: boolean;
};

interface EditMemberModalProps {
  member: Member;
  onClose: () => void;
}

export default function EditMemberModal({
  member,
  onClose,
}: EditMemberModalProps) {
  const [name, setName] = useState(member.name ?? "");
  const [mobile, setMobile] = useState(member.mobile ?? "");
  const [wardId, setWardId] = useState(member.ward?.id ?? "");
  const [isHead, setIsHead] = useState(!!member.familyHead);

  // ✅ Fetch all wards
  const { data: wards } = api.ward.getAllWards.useQuery();
  const updateMember = api.family.updateParishoner.useMutation({
    onSuccess: () => {
      window.location.reload(); // 🔄 Full page refresh after update
    },
  });

  const handleSave = () => {
    updateMember.mutate(
      { parishonerId: member.id, name, mobile, wardId, head: isHead },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6">
        <h2 className="text-lg font-bold">Edit Member</h2>

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

        {/* ✅ Ward Selection */}
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
          <input
            type="checkbox"
            checked={isHead}
            onChange={() => setIsHead(!isHead)}
          />
          Assign as Family Head
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
