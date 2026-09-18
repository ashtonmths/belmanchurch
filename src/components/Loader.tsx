"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const loadingStartedAt = useRef(Date.now());

  useEffect(() => {
    const beginNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.origin !== location.origin ||
        anchor.pathname === location.pathname
      )
        return;
      loadingStartedAt.current = Date.now();
      setLoading(true);
    };
    document.addEventListener("click", beginNavigation);
    return () => document.removeEventListener("click", beginNavigation);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const finish = async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const pendingImages = Array.from(document.images).filter((image) => {
        if (image.complete || image.loading === "lazy") return false;
        const rect = image.getBoundingClientRect();
        return rect.top < window.innerHeight * 1.5;
      });
      await Promise.race([
        Promise.all(
          pendingImages.map(
            (image) =>
              new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), {
                  once: true,
                });
              }),
          ),
        ),
        new Promise<void>((resolve) => window.setTimeout(resolve, 8000)),
      ]);
      const remaining = Math.max(
        0,
        1000 - (Date.now() - loadingStartedAt.current),
      );
      window.setTimeout(() => !cancelled && setLoading(false), remaining);
    };
    void finish();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#17110c]">
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-[#17110c]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative grid h-24 w-24 place-items-center rounded-full border border-[#f0c878]/30"
              >
                <motion.span
                  className="absolute inset-[-1px] rounded-full border-t border-[#f0c878]"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    ease: "linear",
                  }}
                />
                <Image
                  src="/Logo.png"
                  alt="St. Joseph Church"
                  width={62}
                  height={62}
                  className="object-contain"
                  priority
                />
              </motion.div>
              <p className="mt-5 text-sm font-medium tracking-wide text-white/70">
                St. Joseph Church, Belman
              </p>
              <div className="mt-4 h-px w-32 overflow-hidden bg-white/10">
                <motion.div
                  className="h-full bg-[#f0c878]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.1,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
