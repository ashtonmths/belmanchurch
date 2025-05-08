"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useState } from "react";
import { useRole } from "~/hooks/useRole";
import { signIn } from "next-auth/react";
import Button from "~/components/Button";

export default function Home() {
  const router = useRouter();
  const role = useRole();
  const [massModal, setMassModal] = useState(false);

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col overflow-hidden text-center">
          <div className="mt-[15%] flex flex-col items-center justify-center md:mt-[8%]">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold text-primary md:text-6xl"
            >
              St. Joseph Church Belman
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="mt-4 max-w-2xl text-lg italic text-primary md:text-xl"
            >
              “In Joseph … heads of the household are blessed with the
              unsurpassed model of fatherly watchfulness and care.”
              <br />
              <span className="text-primary">— Pope Leo XIII</span>
            </motion.p>
          </div>

          <div className="flex flex-col items-center justify-center pt-[3%]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex space-x-6 md:space-x-10"
            >
              {!role ? (
                <Button onClick={() => signIn("google")}>Login</Button>
              ) : role === "ADMIN" || role === "DEVELOPER" ? (
                <Button onClick={() => router.push("/admin")}>Admin</Button>
              ) : role === "PHOTOGRAPHER" ? (
                <Button onClick={() => router.push("/admin/gallery")}>
                  Upload
                </Button>
              ) : role === "PARISHONER" || role === "USER" ? null : null}
              <Button onClick={() => router.push("/gallery")}>Gallery</Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex space-x-6 md:space-x-10"
            >
              <Button onClick={() => setMassModal(true)}>Mass Timings</Button>
            </motion.div>
          </div>
        </div>
      </div>
      {massModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={() => setMassModal(false)}
            className="mb-4 self-center rounded-full bg-white text-red-500 hover:text-red-800"
          >
            <X size={48} />
          </button>

          {/* Timings Card */}
          <div className="w-full max-w-3xl rounded-xl border-4 border-accent bg-primary p-6 text-center font-semibold text-textcolor">
            <div className="space-y-4 text-base">
              {/* Mass Timings */}
              <div>
                <h2 className="mb-1 text-lg underline">Mass Timings</h2>
                <p>Weekdays: 6:30 AM</p>
                <p>
                  Friday: 4:00 PM{" "}
                  <span className="text-sm font-normal">
                    (Mass and Adoration)
                  </span>
                </p>
                <p>Saturday: 4:00 PM</p>
                <p>Sunday: 7:30 AM & 10:30 AM</p>
              </div>

              <div className="border-t border-primary" />

              {/* Catechism */}
              <div>
                <h2 className="mb-1 text-lg underline">Catechism</h2>
                <p>Sunday: 9:15 AM – 10:30 AM</p>
              </div>

              <div className="border-t border-primary" />

              {/* Shrine */}
              <div>
                <h2 className="mb-1 text-lg underline">
                  St. Anthony Shrine, Pakala
                </h2>
                <p>Tuesday: 4:00 PM</p>
                <p>First Tuesday of the Month: 3:00 PM</p>
              </div>

              <div className="border-t border-primary" />

              {/* Office Timings */}
              <div>
                <h2 className="mb-1 text-lg underline">Office Timings</h2>
                <p>Weekdays: 9:00 AM – 1:00 PM & 2:00 PM – 5:00 PM</p>
                <a href="tel:+919141031604">Mobile: +91 9141031604</a>
                <p className="text-sm font-normal italic">Sunday Holiday</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
