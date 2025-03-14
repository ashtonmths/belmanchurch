"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import Button from "~/components/Button";

export default function AdminGallery() {
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    venue: "",
    info: "",
  });

  const [bethkatiData, setBethkatiData] = useState({
    url: "",
    year: "",
    month: "",
  });

  const createEvent = api.misc.createEvent.useMutation();
  const createBethkati = api.misc.createBethkati.useMutation();

  const handlePublishEvent = async () => {
    await createEvent.mutateAsync(eventData);
    alert("Event Published!");
  };

  const handlePublishBethkati = async () => {
    await createBethkati.mutateAsync({
      ...bethkatiData,
      year: Number(bethkatiData.year),
    });
    alert("Bethkati Published!");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/admin.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/40 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center text-center">
          <div className="grid h-screen w-full grid-cols-4 grid-rows-4 gap-4">
            <div className="col-span-4 col-start-1 row-span-2 row-start-1 flex flex-col items-center justify-center space-y-4 rounded-md border-2 border-primary bg-black/30 p-6 md:col-span-2 md:row-span-4">
              <h1 className="-mt-12 text-3xl font-semibold text-primary">
                EVENT DETAILS
              </h1>
              <input
                type="text"
                id="event_name"
                placeholder="Event Name"
                value={eventData.name}
                onChange={(e) =>
                  setEventData({ ...eventData, name: e.target.value })
                }
                className="w-[60%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <input
                type="datetime-local"
                id="event_date"
                value={eventData.date}
                onChange={(e) =>
                  setEventData({ ...eventData, date: e.target.value })
                }
                className="w-[60%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <input
                type="text"
                id="event_venue"
                placeholder="Event Venue"
                value={eventData.venue}
                onChange={(e) =>
                  setEventData({ ...eventData, venue: e.target.value })
                }
                className="w-[60%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <textarea
                id="event_info"
                placeholder="Additional Info (optional)"
                value={eventData.info}
                onChange={(e) =>
                  setEventData({ ...eventData, info: e.target.value })
                }
                className="h-24 w-[60%] mb-2 resize-none rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <br />
              <Button onClick={handlePublishEvent}>Publish</Button>
            </div>
            <div className="col-span-4 col-start-1 row-span-2 row-start-3 flex flex-col items-center justify-center space-y-4 rounded-md border-2 border-primary bg-black/30 md:col-span-2 md:col-start-3 md:row-span-4 md:row-start-1">
              <h1 className="-mt-12 text-3xl font-semibold text-primary">
                BETHKATI DETAILS
              </h1>
              <input
                type="text"
                id="bethkati_url"
                value={bethkatiData.url}
                onChange={(e) =>
                  setBethkatiData({ ...bethkatiData, url: e.target.value })
                }
                placeholder="Bethkati URL (cloudinary)"
                className="w-[50%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <input
                type="number"
                id="bethkati_year"
                placeholder="Bethkati Year"
                value={bethkatiData.year}
                onChange={(e) =>
                  setBethkatiData({ ...bethkatiData, year: e.target.value })
                }
                className="w-[50%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <input
                type="text"
                id="bethkati_month"
                placeholder="Bethkati Month"
                value={bethkatiData.month}
                onChange={(e) =>
                  setBethkatiData({ ...bethkatiData, month: e.target.value })
                }
                className="w-[50%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
              />
              <br />
              <Button onClick={handlePublishBethkati}>Publish</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
