"use client";

import { type ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  onClick,
  variant = "default",
  className,
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold tracking-wide shadow-sm transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "border-accent bg-accent text-white hover:-translate-y-0.5 hover:bg-textcolor focus-visible:ring-accent",
        variant === "secondary" &&
          "border-primary bg-primary text-textcolor hover:-translate-y-0.5 hover:bg-secondary focus-visible:ring-accent",
        variant === "outline" &&
          "border-current bg-transparent text-inherit hover:bg-white/10 focus-visible:ring-primary",
        variant === "ghost" &&
          "border-transparent bg-transparent text-inherit shadow-none hover:bg-black/5 focus-visible:ring-accent",
        variant === "destructive" &&
          "border-red-700 bg-red-700 text-white hover:-translate-y-0.5 hover:bg-red-800 focus-visible:ring-red-500",
        className,
      )}
    >
      {children}
    </button>
  );
}
