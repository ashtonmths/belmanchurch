import { useState } from "react";
import { api } from "~/trpc/react";

interface AddMemberModalProps {
  familyId: string;
  onClose: () => void;
}

export default function AddMemberModal({
  familyId,
  onClose,
}: AddMemberModalProps) {
  const [selectedParishonerId, setSelectedParishonerId] = useState("");
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ✅ Fetch all parishioners
  const { data: parishoners } = api.family.getAllParishoners.useQuery();

  const addMember = api.family.assignParishonerToFamily.useMutation({
    onSuccess: () => {
      window.location.reload(); // 🔄 Refresh to reflect new member
    },
  });

  const handleSave = () => {
    if (!selectedParishonerId) return;
    addMember.mutate(
      { parishonerId: selectedParishonerId, familyId },
      { onSuccess: () => onClose() },
    );
  };

  // ✅ Filter parishioners based on search input
  const filteredParishoners = parishoners?.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg bg-white p-6">
        <h2 className="text-lg font-bold">Add Member to Family</h2>

        {/* ✅ Search Input */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Search Parishoner..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="w-full rounded border p-2"
          />

          {/* ⬇️ Dropdown List */}
          {isDropdownOpen && (
            <ul className="absolute left-0 top-full mt-1 max-h-48 w-full overflow-y-auto rounded border bg-white shadow-lg">
              {filteredParishoners?.map((p) => (
                <li
                  key={p.id}
                  className={`cursor-pointer p-2 hover:bg-gray-200 ${
                    selectedParishonerId === p.id ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => {
                    setSelectedParishonerId(p.id);
                    setSearch(p.name ?? ""); // Ensure it's always a string
                    setIsDropdownOpen(false); // Close dropdown
                  }}
                >
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="rounded bg-gray-300 px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-primary px-4 py-2 text-white"
            disabled={!selectedParishonerId}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
