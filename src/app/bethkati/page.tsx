"use client";

import { BookOpen, CalendarDays } from "lucide-react";
import { useState } from "react";
import BethkatiViewer from "~/components/BethkatiReader";
import Button from "~/components/Button";
import PageShell from "~/components/PageShell";
import { api } from "~/trpc/react";

export default function Bethkati() {
  const { data: issues, isLoading } = api.misc.getAllBethkati.useQuery();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (selectedFile) {
    return (
      <PageShell title="Bethkati">
        <div className="min-h-[65vh] overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-6">
          <BethkatiViewer
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Bethkati"
      description="Read the latest news, reflections and updates from St. Joseph Church."
    >
      {isLoading ? (
        <p className="text-white/65">Loading issues…</p>
      ) : !issues?.length ? (
        <p className="rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center text-white/65">
          No issues available.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {issues.map((issue) => (
            <article
              key={issue.url}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f0c878] text-[#2a1b10]">
                  <BookOpen size={22} />
                </div>
                <span className="flex items-center gap-2 text-sm text-white/55">
                  <CalendarDays size={15} />
                  {issue.year}
                </span>
              </div>
              <h2 className="mt-8 text-xl font-semibold text-white">
                {issue.month} {issue.year}
              </h2>
              <p className="mt-2 text-sm text-white/55">Parish newsletter</p>
              <Button
                className="mt-6 w-full"
                onClick={() => setSelectedFile(issue.url)}
              >
                Open issue
              </Button>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
