"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import EditMemberModal from "~/components/modals/EditMemberModal";
import AddParishonerModal from "~/components/modals/AddParishonerModal";
import AddFamilyModal from "~/components/modals/AddFamilyModal";
import AddToFamilyModal from "~/components/modals/AddToFamilyModal";
import ProtectedRoute from "~/components/ProtectRoute";
import PageShell from "~/components/PageShell";
import { ChevronDown, Plus, Search, UserRound } from "lucide-react";

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
      <PageShell
        admin
        title="Families"
        description="Find parish households, review members and keep family records up to date."
      >
        <div className="flex min-h-[65vh] flex-col rounded-3xl border border-white/10 bg-[#211811]/90 p-4 sm:p-7">
          {/* Buttons and Search Bar */}
          <div className="mb-6 flex w-full flex-col items-stretch justify-between gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-[#f0c878] px-5 py-2.5 text-sm font-semibold text-[#211811]"
                onClick={() => setShowAddFamily(true)}
              >
                <Plus className="mr-2 inline" size={16} />
                Add family
              </button>
              <button
                className="rounded-full border border-[#f0c878]/40 px-5 py-2.5 text-sm font-semibold text-[#f0c878]"
                onClick={() => setShowAddParishoner(true)}
              >
                <Plus className="mr-2 inline" size={16} />
                Add parishioner
              </button>
            </div>
            <label className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 text-white/40">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search Family..."
                className="min-h-11 min-w-0 bg-transparent text-sm text-white placeholder-white/40 outline-none sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          {/* Family List */}
          {isLoading ? (
            <p className="text-xl text-white">Loading families...</p>
          ) : (
            <div className="w-full">
              {filteredFamilies?.length === 0 ? (
                <p className="text-lg text-white">No families found.</p>
              ) : (
                filteredFamilies?.map((family) => (
                  <div
                    key={family.id}
                    className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-white sm:p-5"
                  >
                    <button
                      onClick={() =>
                        setSelectedFamilyId(
                          selectedFamilyId === family.id ? null : family.id,
                        )
                      }
                      className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="flex items-center gap-3 text-lg font-semibold">
                        <UserRound size={18} className="text-[#f0c878]" />
                        {family.name}
                        <ChevronDown
                          size={17}
                          className={`text-white/40 transition ${selectedFamilyId === family.id ? "rotate-180" : ""}`}
                        />
                      </span>

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
                        <span className="text-sm font-normal text-white/45">
                          Head: {family.head?.name ?? "Not assigned"}
                        </span>
                      </div>
                    </button>
                    {/* Member List (Visible if selected) */}
                    {selectedFamilyId === family.id && (
                      <div className="mt-3 space-y-2">
                        {members?.map((member) => (
                          <div
                            key={member.id}
                            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
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
