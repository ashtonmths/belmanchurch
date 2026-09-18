"use client";
import { useState } from "react";
import {
  AdminDialog,
  adminInput,
  DialogActions,
} from "~/components/admin/AdminDialog";
import { api } from "~/trpc/react";
type Member = {
  id: string;
  name?: string | null;
  mobile?: string;
  ward?: { id: string; name: string } | null;
  familyHead?: boolean;
};
export default function EditMemberModal({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const [name, setName] = useState(member.name ?? "");
  const [mobile, setMobile] = useState(member.mobile ?? "");
  const [wardId, setWardId] = useState(member.ward?.id ?? "");
  const [head, setHead] = useState(!!member.familyHead);
  const { data: wards } = api.ward.getAllWards.useQuery();
  const update = api.parishoner.updateParishoner.useMutation({
    onSuccess: () => window.location.reload(),
  });
  return (
    <AdminDialog
      title="Edit member"
      onClose={onClose}
      actions={
        <DialogActions
          onClose={onClose}
          onSave={() =>
            update.mutate({
              parishonerId: member.id,
              name,
              mobile,
              wardId,
              head,
            })
          }
          disabled={!name || !mobile || update.isPending}
        />
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-white/55">
          Name
          <input
            className={adminInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="text-sm text-white/55">
          Mobile
          <input
            className={adminInput}
            inputMode="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </label>
        <label className="text-sm text-white/55 sm:col-span-2">
          Ward
          <select
            className={adminInput}
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
          >
            <option value="">Select ward</option>
            {wards?.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={head}
          onChange={(e) => setHead(e.target.checked)}
          className="h-4 w-4 accent-[#f0c878]"
        />
        Assign as family head
      </label>
    </AdminDialog>
  );
}
