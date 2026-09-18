"use client";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const adminInput =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#f0c878]";
export function AdminDialog({
  title,
  onClose,
  children,
  actions,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="my-6 w-full max-w-lg rounded-3xl border border-white/10 bg-[#211811] p-5 text-left text-white shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/60"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 space-y-5">{children}</div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {actions}
        </div>
      </section>
    </div>
  );
}
export function DialogActions({
  onClose,
  onSave,
  label = "Save",
  disabled = false,
}: {
  onClose: () => void;
  onSave: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-white/15 px-5 py-2.5 text-white/65"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onSave}
        className="rounded-full bg-[#f0c878] px-6 py-2.5 font-semibold text-[#211811] disabled:opacity-40"
      >
        {label}
      </button>
    </>
  );
}
