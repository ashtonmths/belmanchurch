import { ArrowLeft, Images, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "~/components/PageShell";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested page could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageShell contentClassName="flex min-h-[65vh] items-center justify-center">
      <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#211811]/95 p-7 text-center shadow-2xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f0c878]">
          Error 404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          This page could not be found
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55">
          The address may have changed, or the page may no longer be available.
          You can return home or continue to another part of the parish website.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f0c878] px-6 font-semibold text-[#211811] transition hover:bg-[#e7bb64]"
          >
            <ArrowLeft size={17} /> Return home
          </Link>
          <Link
            href="/gallery"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 font-semibold text-white/70 transition hover:border-[#f0c878]/60 hover:text-[#f0c878]"
          >
            <Images size={17} /> View gallery
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 font-semibold text-white/70 transition hover:border-[#f0c878]/60 hover:text-[#f0c878]"
          >
            <Mail size={17} /> Contact us
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
