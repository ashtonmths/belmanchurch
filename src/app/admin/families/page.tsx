"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import EditMemberModal from "~/components/modals/EditMemberModal";
import AddParishonerModal from "~/components/modals/AddParishonerModal";
import AddFamilyModal from "~/components/modals/AddFamilyModal";
import AddToFamilyModal from "~/components/modals/AddToFamilyModal";
import ProtectedRoute from "~/components/ProtectRoute";

type Member = {
  id: string;
  name?: string | null;
  mobile?: string;
  ward?: { id: string; name: string } | null;
  familyHead?: boolean;
};

export default function Families() {
  const { data: families, isLoading } = api.family.getAllFamilies.useQuery();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const { data: members } = api.family.getFamilyMembers.useQuery(
    { familyId: selectedFamilyId ?? "" },
    { enabled: !!selectedFamilyId }, // Fetch only when a family is selected
  );
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showAddParishoner, setShowAddParishoner] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  // Filter families based on search input
  const filteredFamilies = families?.filter((family) =>
    family.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>  
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center text-center">
          {/* Buttons and Search Bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-3">
              <button
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-textcolor"
                onClick={() => setShowAddFamily(true)}
              >
                Add a Family
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-textcolor"
                onClick={() => setShowAddParishoner(true)}
              >
                Add a Parishoner
              </button>
            </div>
            <input
              type="text"
              placeholder="Search Family..."
              className="ml-3 rounded-lg border bg-primary px-4 py-2 font-semibold text-textcolor placeholder-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Family List */}
          {isLoading ? (
            <p className="text-xl text-white">Loading families...</p>
          ) : (
            <div className="w-full max-w-4xl">
              {filteredFamilies?.length === 0 ? (
                <p className="text-lg text-white">No families found.</p>
              ) : (
                filteredFamilies?.map((family) => (
                  <div
                    key={family.id}
                    className="mb-4 rounded-xl bg-secondary p-4 text-textcolor"
                  >
                    <button
                      onClick={() =>
                        setSelectedFamilyId(
                          selectedFamilyId === family.id ? null : family.id,
                        )
                      }
                      className="flex w-full items-center justify-between text-xl font-semibold"
                    >
                      {family.name}

                      <div className="flex items-center space-x-3">
                        {/* ✅ Fix: Use a <span> instead of <button> */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFamily(family.id);
                            setIsAddMemberOpen(true);
                          }}
                          className="cursor-pointer rounded bg-accent px-2 py-1 text-sm text-primary"
                        >
                          + Add Member
                        </span>

                        {/* 🏠 Family Head */}
                        <span>({family.head?.name ?? "No Head"})</span>
                      </div>
                    </button>
                    {/* Member List (Visible if selected) */}
                    {selectedFamilyId === family.id && (
                      <div className="mt-3 space-y-2">
                        {members?.map((member) => (
                          <div
                            key={member.id}
                            className="flex justify-between rounded-lg bg-accent p-3 text-primary font-semibold"
                          >
                            <span>
                              {member.name} - {member.mobile} -{" "}
                              {member.ward?.name}
                            </span>
                            <button
                              className="text-sm underline"
                              onClick={() =>
                                setSelectedMember({
                                  ...member,
                                  ward: member.ward
                                    ? {
                                        id: member.ward.id,
                                        name: member.ward.name,
                                      }
                                    : null,
                                  familyHead: !!member.familyHead, // Convert to boolean
                                })
                              }
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Edit Member Modal */}
          {selectedMember && (
            <EditMemberModal
              member={selectedMember}
              onClose={() => setSelectedMember(null)} // Close modal
            />
          )}
          {showAddFamily && (
            <AddFamilyModal onClose={() => setShowAddFamily(false)} />
          )}
          {showAddParishoner && (
            <AddParishonerModal onClose={() => setShowAddParishoner(false)} />
          )}
          {isAddMemberOpen && selectedFamily && (
            <AddToFamilyModal
              familyId={selectedFamily}
              onClose={() => setIsAddMemberOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
