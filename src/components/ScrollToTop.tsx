"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Go to top"
      className={`fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-[#211811]/90 text-[#f0c878] shadow-lg backdrop-blur-md transition duration-200 hover:border-[#f0c878] hover:bg-[#f0c878] hover:text-[#211811] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c878] sm:bottom-7 sm:right-7 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp aria-hidden="true" size={19} />
    </button>
  );
}
