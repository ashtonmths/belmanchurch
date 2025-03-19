"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "~/hooks/useRole";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const role = useRole();

  return (
    <>
      {/* Navbar */}
      <div className="absolute z-20 flex w-full justify-center">
        <nav className="mt-[5%] flex h-[12%] w-[90%] items-center rounded-xl bg-black/50 px-0 md:mt-[2%] md:px-2">
          {/* Logo */}
          <div className="flex select-none flex-row items-center">
            <Image
              alt="logo"
              src="/Logo.png"
              height={75}
              width={75}
              className="mb-2"
              onClick={() => router.push("/admin")}
            />
            <h1
              className="text-sm font-bold tracking-wider text-primary md:text-lg"
              onClick={() => router.push("/admin")}
            >
              ADMIN
            </h1>
          </div>

          {role == "PHOTOGRAPHER" ? (
            <div className="ml-auto mr-6 hidden space-x-8 font-bold text-primary md:flex">
              <NavButton route="/admin/gallery">Gallery</NavButton>
              <NavButton route="/">Home</NavButton>
            </div>
          ) : (
            <div className="ml-auto mr-6 hidden space-x-8 font-bold text-primary md:flex">
              <NavButton route="/admin/donation">Donation</NavButton>
              <NavButton route="/admin/families">Families</NavButton>
              <NavButton route="/admin/misc">Events & Bethkati</NavButton>
              <NavButton route="/admin/gallery">Gallery</NavButton>
              <NavButton route="/">Home</NavButton>
            </div>
          )}
          {/* Mobile Menu Icon */}
          <button
            className="ml-auto mr-6 text-primary md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={30} />
          </button>
        </nav>
      </div>

      {/* Mobile Menu with Fade Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-black/85"
          >
            {role == "PHOTOGRAPHER" ? (
              <div className="flex flex-col items-center justify-center space-y-6 text-2xl font-bold text-primary">
                <NavButton
                  route="/admin/gallery"
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </NavButton>
                <NavButton route="/" onClick={() => setIsOpen(false)}>
                  Home
                </NavButton>
                <br />
                <button
                  className="text-whiite"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={35} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6 text-2xl font-bold text-primary">
                <NavButton
                  route="/admin/donation"
                  onClick={() => setIsOpen(false)}
                >
                  Donation
                </NavButton>
                <NavButton
                  route="/admin/families"
                  onClick={() => setIsOpen(false)}
                >
                  Families
                </NavButton>
                <NavButton route="/admin/misc" onClick={() => setIsOpen(false)}>
                  Events & Bethkati
                </NavButton>
                <NavButton
                  route="/admin/gallery"
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </NavButton>
                <NavButton route="/" onClick={() => setIsOpen(false)}>
                  Home
                </NavButton>
                <br />
                <button
                  className="text-whiite"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={35} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function NavButton({
    route,
    children,
    onClick,
  }: {
    route: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) {
    return (
      <button
        className="text-lg text-primary hover:text-primary/55"
        onClick={() => {
          router.push(route);
          onClick?.(); // Close menu on mobile
        }}
      >
        {children}
      </button>
    );
  }
}
