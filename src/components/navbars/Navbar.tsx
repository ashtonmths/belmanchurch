"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Navbar */}
      <div className="absolute flex justify-center w-full z-20">
        <nav className="mt-[5%] md:mt-[2%] flex h-[12%] w-[90%] items-center rounded-xl bg-primary/55 px-0 md:px-2">
          {/* Logo */}
          <div className="flex flex-row items-center select-none" onClick={() => router.push('/')}>
            <Image alt="logo" src="/Logo.png" height={75} width={75} className="mb-2" />
            <h1 className="font-bold tracking-wider text-textcolor text-sm md:text-lg">
              St. Joseph
              <br />
              Church Belman
            </h1>
          </div>

          <div className="hidden md:flex ml-auto space-x-8 mr-6 text-textcolor font-bold">
            <NavButton route="/">Home</NavButton>
            {/* <NavButton route="/gallery">Gallery</NavButton> */}
            <NavButton route="/events">Events</NavButton>
            <NavButton route="/bethkati">Bethkati</NavButton>
            <NavButton route="/about">About</NavButton>
          </div>

          {/* Mobile Menu Icon */}
          <button className="md:hidden ml-auto mr-6 text-textcolor" onClick={() => setIsOpen(true)}>
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
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-primary"
          >
            <div className="flex flex-col space-y-6 text-2xl text-textcolor font-bold justify-center items-center">
              <NavButton route="/" onClick={() => setIsOpen(false)}>
                Home
              </NavButton>
              <NavButton route="/gallery" onClick={() => setIsOpen(false)}>
                Gallery
              </NavButton>
              <NavButton route="/events" onClick={() => setIsOpen(false)}>
                Events
              </NavButton>
              <NavButton route="/bethkati" onClick={() => setIsOpen(false)}>
                Bethkati
              </NavButton>
              <NavButton route="/about" onClick={() => setIsOpen(false)}>
                About
              </NavButton>
              <br />
              <button className="text-textcolor" onClick={() => setIsOpen(false)}>
                <X size={35} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function NavButton({ route, children, onClick }: { route: string; children: React.ReactNode; onClick?: () => void }) {
    return (
      <button
        className="text-textcolor hover:text-textcolor/55 text-lg"
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
