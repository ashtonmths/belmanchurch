"use client";
import { useState } from "react";
import {
  AdminDialog,
  adminInput,
  DialogActions,
} from "~/components/admin/AdminDialog";
import { api } from "~/trpc/react";
export default function AddParishonerModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [wardId, setWardId] = useState("");
  const [familyId, setFamilyId] = useState("");
  const { data: wards } = api.ward.getAllWards.useQuery();
  const { data: families } = api.family.getAllFamilies.useQuery();
  const add = api.parishoner.addParishoner.useMutation({
    onSuccess: () => window.location.reload(),
  });
  return (
    <AdminDialog
      title="Add parishioner"
      onClose={onClose}
      actions={
        <DialogActions
          onClose={onClose}
          onSave={() => add.mutate({ name, mobile, wardId, familyId })}
          disabled={!name || !mobile || add.isPending}
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
        <label className="text-sm text-white/55">
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
        <label className="text-sm text-white/55">
          Family
          <select
            className={adminInput}
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
          >
            <option value="">Select family</option>
            {families?.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </AdminDialog>
  );
}
