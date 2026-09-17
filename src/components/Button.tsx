"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive";
  className?: string;
  disabled?: boolean;
  /**
   * Renders the button as a real link. Prefer this over an onClick that pushes
   * a route: crawlers can follow it, and it supports middle-click and
   * open-in-new-tab.
   */
  href?: string;
}

export default function Button({
  children,
  onClick,
  variant = "default",
  className,
  disabled = false,
  href,
}: ButtonProps) {
  const classes = clsx(
        "relative z-10 w-32 md:w-36 h-12 cursor-pointer rounded-full text-lg font-bold text-textcolor transition-all duration-300 ease-in-out focus:ring-2 before:absolute before:-top-1 before:-bottom-1 before:-left-1 before:-right-1 before:-z-10 before:rounded-[35px] before:transition-all before:duration-1000 before:ease-in-out before:hover:blur-xl",
        variant === "default"
          ? "bg-gradient-to-r from-primary via-accent to-secondary bg-[length:400%] hover:animate-gradient-xy hover:bg-[length:100%] active:bg-primary focus:ring-secondary before:bg-gradient-to-r before:from-primary before:via-secondary before:to-primary before:bg-[length:400%] before:hover:bg-[length:100%]"
          : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-400 before:bg-red-600 before:hover:bg-red-700",
        disabled &&
          "cursor-not-allowed opacity-50 before:blur-0 before:bg-gray-400 before:hover:bg-gray-400", // Disabled styling
    className, // Allows overwriting or adding extra classes
  );

  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} className={clsx(classes, "inline-flex items-center justify-center")}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
