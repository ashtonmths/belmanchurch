"use client";

import { type ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive";
  className?: string;
}

export default function Button({ children, onClick, variant = "default", className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative z-10 w-32 md:w-36 h-12 cursor-pointer rounded-full text-lg font-bold text-textcolor transition-all duration-300 ease-in-out focus:ring-2 before:absolute before:-top-1 before:-bottom-1 before:-left-1 before:-right-1 before:-z-10 before:rounded-[35px] before:transition-all before:duration-1000 before:ease-in-out before:hover:blur-xl",
        variant === "default"
          ? "bg-gradient-to-r from-primary via-accent to-secondary bg-[length:400%] hover:animate-gradient-xy hover:bg-[length:100%] active:bg-primary focus:ring-secondary before:bg-gradient-to-r before:from-primary before:via-secondary before:to-primary before:bg-[length:400%] before:hover:bg-[length:100%]"
          : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-400 before:bg-red-600 before:hover:bg-red-700",
        className // Allows overwriting or adding extra classes
      )}
    >
      {children}
    </button>
  );
}