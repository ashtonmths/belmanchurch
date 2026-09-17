"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import EditMemberModal from "~/components/modals/EditMemberModal";
import AddParishonerModal from "~/components/modals/AddParishonerModal";
import AddFamilyModal from "~/components/modals/AddFamilyModal";
import AddToFamilyModal from "~/components/modals/AddToFamilyModal";
import ProtectedRoute from "~/components/ProtectRoute";
import PageShell from "~/components/PageShell";

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
      <PageShell admin title="Families">
        <div className="flex min-h-[65vh] flex-col items-center rounded-3xl border border-white/10 bg-black/30 p-4 text-center backdrop-blur-md sm:p-6">
          {/* Buttons and Search Bar */}
          <div className="mb-6 flex w-full max-w-4xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-[#f0c878] px-5 py-2.5 text-sm font-semibold text-[#211811]"
                onClick={() => setShowAddFamily(true)}
              >
                Add a Family
              </button>
              <button
                className="rounded-full border border-[#f0c878]/40 px-5 py-2.5 text-sm font-semibold text-[#f0c878]"
                onClick={() => setShowAddParishoner(true)}
              >
                Add a Parishoner
              </button>
            </div>
            <input
              type="text"
              placeholder="Search Family..."
              className="rounded-full border border-white/15 bg-white/10 px-5 py-2 font-semibold text-white placeholder-white/45 focus:outline-none focus:ring-2 focus:ring-[#f0c878]"
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
                    className="mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-white"
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
                            className="flex justify-between rounded-lg bg-accent p-3 font-semibold text-primary"
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
      </PageShell>
    </ProtectedRoute>
  );
}
