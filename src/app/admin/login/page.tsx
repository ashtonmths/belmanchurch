"use client";

import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const role = session?.user?.role;
    if (role === "ADMIN" || role === "DEVELOPER") router.replace("/admin");
  }, [session, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn("admin", { username, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("That username and password don't match. Please try again.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16">
      <Image
        src="/bg/admin.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />

      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur md:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <Image src="/Logo.png" alt="" width={72} height={72} className="h-16 w-16 object-contain" />
          <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">Parish Admin</h1>
          <p className="mt-1 text-sm text-textcolor/70">St. Joseph Church, Belman</p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Username</span>
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-accent/20 bg-cream/60 px-4 py-3 text-ink outline-none focus:border-accent focus:bg-white focus:ring-2 focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Password</span>
            <span className="relative block">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-accent/20 bg-cream/60 px-4 py-3 pr-12 text-ink outline-none focus:border-accent focus:bg-white focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-textcolor/60 hover:text-ink"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-cream transition hover:bg-accent disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
          Sign in
        </button>
      </form>
    </div>
  );
}
