"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import Button from "~/components/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "~/components/ProtectRoute";
import PageShell from "~/components/PageShell";

interface CloudinaryResponse {
  secure_url: string;
  error?: { message: string };
}

export default function AdminMisc() {
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    venue: "",
    info: "",
  });
  const [bethkatiData, setBethkatiData] = useState({
    year: "",
    month: "",
  });

  const createEvent = api.misc.createEvent.useMutation();
  const createBethkati = api.misc.createBethkati.useMutation();
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    setPdfFile(file);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          const split = result.split(",");
          const base64 = split[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to extract base64 from result"));
          }
        } else {
          reject(new Error("FileReader result is not a string"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsDataURL(file);
    });
  };

  const handlePublishBethkati = async () => {
    if (!pdfFile || !bethkatiData.year || !bethkatiData.month) {
      toast.warning("All fields are required including PDF!");
      return;
    }

    try {
      // Convert file to base64 and prefix it properly
      const base64Raw: string = await fileToBase64(pdfFile);
      const base64Prefixed = `data:application/pdf;base64,${base64Raw}`;

      const toastId = toast.info("Uploading PDF...", {
        autoClose: false,
        progress: undefined,
      });

      const formData = new FormData();
      formData.append("file", base64Prefixed); // Include full data URI here
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      );
      formData.append("folder", `Bethkati/`);
      formData.append("public_id", pdfFile.name.replace(/\.pdf$/, ""));

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = (await response.json()) as CloudinaryResponse;

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Upload failed");
      }

      toast.update(toastId, {
        render: "Uploaded successfully!",
        type: "success",
        autoClose: 3000,
      });

      await createBethkati.mutateAsync({
        pdfUrl: data.secure_url,
        year: Number(bethkatiData.year),
        month: bethkatiData.month,
        fileName: pdfFile.name,
      });

      toast.success("Bethkati Published!");
      setPdfFile(null);
      setBethkatiData({ year: "", month: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Failed to publish Bethkati: ${err.message}`);
      } else {
        toast.error("Failed to publish Bethkati!");
      }
    }
  };

  const handlePublishEvent = async () => {
    try {
      await createEvent.mutateAsync(eventData);
      toast.success("Event Published!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Failed to publish event: ${err.message}`);
      } else {
        toast.error("Failed to publish event.");
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Publishing"
        description="Add parish events and publish the next Bethkati issue."
      >
        <ToastContainer />
        <div className="flex min-h-[65vh] flex-col">
          <div className="grid w-full gap-5 md:grid-cols-2">
            <div className="flex h-full flex-col space-y-4 rounded-3xl border border-white/10 bg-[#211811]/90 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">New event</h2>
              <input
                type="text"
                placeholder="Event Name"
                value={eventData.name}
                onChange={(e) =>
                  setEventData({ ...eventData, name: e.target.value })
                }
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] p-3 text-base text-white placeholder-white/40 outline-none focus:border-[#f0c878]"
              />
              <input
                type="datetime-local"
                value={eventData.date}
                onChange={(e) =>
                  setEventData({ ...eventData, date: e.target.value })
                }
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] p-3 text-base text-white outline-none focus:border-[#f0c878]"
              />
              <input
                type="text"
                placeholder="Event Venue"
                value={eventData.venue}
                onChange={(e) =>
                  setEventData({ ...eventData, venue: e.target.value })
                }
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] p-3 text-base text-white placeholder-white/40 outline-none focus:border-[#f0c878]"
              />
              <textarea
                placeholder="Additional Info (optional)"
                value={eventData.info}
                onChange={(e) =>
                  setEventData({ ...eventData, info: e.target.value })
                }
                className="mb-2 h-28 w-full resize-none rounded-xl border border-white/15 bg-white/[0.06] p-3 text-base text-white placeholder-white/40 outline-none focus:border-[#f0c878]"
              />
              <Button onClick={handlePublishEvent}>Publish</Button>
            </div>
            <div className="flex flex-col space-y-4 rounded-3xl border border-white/10 bg-[#211811]/90 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">
                New Bethkati issue
              </h2>

              <input
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.04] p-3 text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-[#f0c878] file:px-4 file:py-2 file:font-semibold file:text-[#211811]"
              />

              <input
                type="number"
                placeholder="Bethkati Year"
                value={bethkatiData.year}
                onChange={(e) =>
                  setBethkatiData({ ...bethkatiData, year: e.target.value })
                }
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] p-3 text-base text-white placeholder-white/40 outline-none focus:border-[#f0c878]"
              />

              <input
                type="text"
                placeholder="Bethkati Month"
                value={bethkatiData.month}
                onChange={(e) =>
                  setBethkatiData({ ...bethkatiData, month: e.target.value })
                }
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] p-3 text-base text-white placeholder-white/40 outline-none focus:border-[#f0c878]"
              />

              <Button onClick={handlePublishBethkati}>Publish</Button>
            </div>
          </div>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
