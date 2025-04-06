"use client";
import { useState } from "react";
import BethkatiViewer from "~/components/BethkatiReader";
import { api } from "~/trpc/react";

export default function Bethkati() {
  const { data: issues, isLoading } = api.misc.getAllBethkati.useQuery();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
        <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center text-primary text-4xl font-bold">
            Loading.....
          </div>
        </div>
      </div>
    );
  }

  if (issues?.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
        <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center text-primary text-4xl font-bold">
            No issues available
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!selectedFile ? (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
          <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center text-center">
              {/* Scrollable Container */}
              <div className="flex w-full items-start justify-center overflow-x-auto p-5">
                <div className="no-scrollbar grid grid-cols-1 gap-10 sm:grid-cols-3 md:grid-cols-4">
                  {issues?.map((issue) => (
                    <div
                      key={issue.url}
                      className="flex h-80 w-60 flex-col items-center justify-center gap-3 rounded-3xl bg-secondary p-4 text-textcolor transition-shadow hover:bg-secondary hover:shadow-2xl hover:shadow-primary"
                    >
                      <div className="text-xl flex h-40 w-52 items-center justify-center rounded-2xl bg-accent font-bold text-primary">
                        {issue.month} - {issue.year}
                      </div>
                      <div className="">
                        <p className="font-extrabold">
                          Bethkati {issue.year}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(issue.url)}
                        className="rounded-xl bg-accent p-2 px-6 font-extrabold text-primary transition-colors hover:bg-primary hover:text-textcolor"
                      >
                        Open Bethkati
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
          <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-xl py-6">
            <div className="flex h-[81%] w-[90%] items-center justify-center">
              <BethkatiViewer
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
