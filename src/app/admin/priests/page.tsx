/* eslint-disable @next/next/no-img-element */
"use client";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { api } from "~/trpc/react";
import "react-toastify/dist/ReactToastify.css";

type Role = "PARISH_PRIEST" | "ASSISTANT_PRIEST";
type Form = {
  id?: string;
  name: string;
  role: Role;
  period: string;
  imageUrl: string;
  isCurrent: boolean;
  order: number;
};
const empty: Form = {
  name: "",
  role: "PARISH_PRIEST",
  period: "",
  imageUrl: "",
  isCurrent: false,
  order: 0,
};
export default function PriestsAdmin() {
  const utils = api.useUtils();
  const { data: priests = [] } = api.misc.getAllPriests.useQuery();
  const [form, setForm] = useState<Form | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const { uploadImages, isUploading } = useCloudinaryUpload();
  const done = async (message: string) => {
    await utils.misc.getAllPriests.invalidate();
    setForm(null);
    setPhoto(null);
    toast.success(message);
  };
  const create = api.misc.createPriest.useMutation({
    onSuccess: () => void done("Priest added"),
    onError: (e) => toast.error(e.message),
  });
  const update = api.misc.updatePriest.useMutation({
    onSuccess: () => void done("Priest updated"),
    onError: (e) => toast.error(e.message),
  });
  const remove = api.misc.deletePriest.useMutation({
    onSuccess: () => void done("Priest removed"),
    onError: (e) => toast.error(e.message),
  });
  const save = async () => {
    if (!form) return;
    let imageUrl = form.imageUrl || null;
    if (photo) {
      const [url] = await uploadImages([photo], "Priests");
      imageUrl = url ?? null;
    }
    const values = {
      name: form.name,
      role: form.role,
      period: form.period,
      imageUrl,
      isCurrent: form.isCurrent,
      order: form.order,
    };
    if (form.id) update.mutate({ id: form.id, ...values });
    else create.mutate(values);
  };
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Priests"
        description="Add clergy records, update service periods and manage portraits."
      >
        <ToastContainer />
        <div className="flex justify-end pb-5">
          <button
            onClick={() => setForm(empty)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f0c878] px-5 font-semibold text-[#211811]"
          >
            <Plus size={17} />
            Add priest
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {priests.map((priest) => (
            <article
              key={priest.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#211811]/90 p-4"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[0.05]">
                {priest.imageUrl ? (
                  <img
                    src={priest.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-white/25">
                    No photo
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{priest.name}</h2>
                <p className="mt-1 text-sm text-white/45">{priest.period}</p>
                <p className="mt-2 text-xs text-[#f0c878]">
                  {priest.role === "PARISH_PRIEST"
                    ? "Parish priest"
                    : "Assistant priest"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    setForm({
                      ...priest,
                      imageUrl: priest.imageUrl ?? "",
                      order: priest.order,
                    })
                  }
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/65"
                  aria-label={`Edit ${priest.name}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() =>
                    confirm(`Remove ${priest.name}?`) &&
                    remove.mutate({ id: priest.id })
                  }
                  className="grid h-9 w-9 place-items-center rounded-full border border-red-400/20 text-red-300"
                  aria-label={`Remove ${priest.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {form && (
          <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setForm(null)}
          >
            <section
              className="my-6 w-full max-w-xl rounded-3xl border border-white/10 bg-[#211811] p-5 shadow-2xl sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold">
                {form.id ? "Edit priest" : "Add priest"}
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
                <Field label="Role">
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as Role })
                    }
                  >
                    <option value="PARISH_PRIEST">Parish priest</option>
                    <option value="ASSISTANT_PRIEST">Assistant priest</option>
                  </select>
                </Field>
                <Field label="Service period">
                  <input
                    value={form.period}
                    onChange={(e) =>
                      setForm({ ...form, period: e.target.value })
                    }
                    placeholder="2024–present"
                  />
                </Field>
                <Field label="Display order">
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                  />
                </Field>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm text-white/55">
                    Portrait
                  </span>
                  <span className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.04] text-sm text-white/60">
                    <Upload size={16} />
                    {photo?.name ?? "Choose image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    />
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) =>
                      setForm({ ...form, isCurrent: e.target.checked })
                    }
                    className="accent-[#f0c878]"
                  />
                  Currently serving in the parish
                </label>
              </div>
              <div className="mt-7 flex justify-end gap-3">
                <button
                  onClick={() => setForm(null)}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-white/65"
                >
                  Cancel
                </button>
                <button
                  disabled={isUploading || create.isPending || update.isPending}
                  onClick={() => void save()}
                  className="rounded-full bg-[#f0c878] px-6 py-2.5 font-semibold text-[#211811] disabled:opacity-40"
                >
                  {isUploading ? "Uploading…" : "Save priest"}
                </button>
              </div>
            </section>
          </div>
        )}
      </PageShell>
    </ProtectedRoute>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-white/55">{label}</span>
      <span className="[&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:border-white/15 [&>*]:bg-white/[0.06] [&>*]:px-4 [&>*]:py-3 [&>*]:text-white [&>*]:outline-none">
        {children}
      </span>
    </label>
  );
}
