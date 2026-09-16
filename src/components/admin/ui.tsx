"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

/** Small, consistent building blocks for the admin panel. */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-serif text-4xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-textcolor/80">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-accent/10 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-accent/20 bg-cream/60 px-4 py-2.5 text-ink outline-none transition placeholder:text-textcolor/40 focus:border-accent focus:bg-white focus:ring-2 focus:ring-primary/50";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-textcolor/60">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-accent",
  secondary: "border border-accent/25 bg-white text-ink hover:border-accent",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-accent hover:bg-primary/20",
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled ?? loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** A button that asks "Are you sure?" inline before running a destructive action. */
export function ConfirmButton({
  onConfirm,
  children,
  label = "Delete",
}: {
  onConfirm: () => void | Promise<unknown>;
  children?: React.ReactNode;
  label?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!asking) {
    return (
      <Button variant="ghost" className="!text-red-700" onClick={() => setAsking(true)}>
        {children ?? label}
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Button
        variant="danger"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onConfirm();
          } finally {
            setBusy(false);
            setAsking(false);
          }
        }}
      >
        Confirm
      </Button>
      <Button variant="ghost" onClick={() => setAsking(false)}>
        Cancel
      </Button>
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm font-medium text-ink"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-accent" : "bg-accent/20"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
      {label}
    </button>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-accent/20 p-10 text-center text-textcolor/70">
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16 text-accent">
      <Loader2 size={32} className="animate-spin" aria-label="Loading" />
    </div>
  );
}

/** Turns an unknown error into a readable message for toasts. */
export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}
