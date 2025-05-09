"use client";
import { api } from "~/trpc/react";

export default function Events() {
  const { data: events } = api.misc.getAllEvents.useQuery();

  if (events?.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
        <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center text-4xl font-bold text-primary">
            No events available
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
        <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col flex-wrap items-center text-center">
            {/* Scrollable Container */}
            <div className="flex w-full items-start justify-center overflow-x-auto p-5">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 md:grid-cols-4">
                {events?.map((event) => (
                  <div
                    key={event.id}
                    className="flex h-80 w-60 flex-col items-center justify-center gap-3 rounded-3xl bg-secondary p-4 text-textcolor transition-shadow hover:bg-secondary hover:shadow-2xl hover:shadow-primary"
                  >
                    <div className="flex h-40 w-52 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-primary">
                      {event.name}
                    </div>
                    <div className="w-full rounded-xl bg-accent p-2 px-6 text-sm font-extrabold text-primary">
                      {new Date(event.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Kolkata",
                    })} IST
                    </div>
                    <div className="w-full rounded-xl bg-accent p-2 px-6 text-sm font-extrabold text-primary">
                      {event.venue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
