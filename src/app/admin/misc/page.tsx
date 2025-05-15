"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import Button from "~/components/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "~/components/ProtectRoute";

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
    if (!file || file.type !== "application/pdf") {
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
      formData.append(
        "folder",
        `Bethkati/`,
      );
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
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/admin.jpg')] bg-cover bg-center">
        <ToastContainer />
        <div className="flex h-screen w-full items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center justify-center overflow-auto text-center">
            <div className="mt-10 grid h-full w-full grid-cols-4 grid-rows-4 gap-4">
              <div className="col-span-4 col-start-1 row-span-2 row-start-1 flex h-full flex-col items-center justify-center space-y-4 rounded-md border-2 border-primary bg-black/30 p-6 md:col-span-2 md:row-span-4">
                <h1 className="text-3xl font-semibold text-primary">
                  EVENT DETAILS
                </h1>
                <input
                  type="text"
                  placeholder="Event Name"
                  value={eventData.name}
                  onChange={(e) =>
                    setEventData({ ...eventData, name: e.target.value })
                  }
                  className="w-[60%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
                />
                <input
                  type="datetime-local"
                  value={eventData.date}
                  onChange={(e) =>
                    setEventData({ ...eventData, date: e.target.value })
                  }
                  className="w-[60%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Event Venue"
                  value={eventData.venue}
                  onChange={(e) =>
                    setEventData({ ...eventData, venue: e.target.value })
                  }
                  className="w-[60%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
                />
                <textarea
                  placeholder="Additional Info (optional)"
                  value={eventData.info}
                  onChange={(e) =>
                    setEventData({ ...eventData, info: e.target.value })
                  }
                  className="mb-2 h-24 w-[60%] resize-none rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
                />
                <Button onClick={handlePublishEvent}>Publish</Button>
              </div>
              <div className="col-span-4 col-start-1 row-span-2 row-start-3 flex flex-col items-center justify-center space-y-4 rounded-md border-2 border-primary bg-black/30 md:col-span-2 md:col-start-3 md:row-span-4 md:row-start-1">
                <h1 className="text-3xl font-semibold text-primary">
                  BETHKATI DETAILS
                </h1>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePDFUpload}
                  className="w-[50%] rounded-lg bg-secondary text-textcolor file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-primary hover:file:bg-accent/80"
                />

                <input
                  type="number"
                  placeholder="Bethkati Year"
                  value={bethkatiData.year}
                  onChange={(e) =>
                    setBethkatiData({ ...bethkatiData, year: e.target.value })
                  }
                  className="w-[50%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Bethkati Month"
                  value={bethkatiData.month}
                  onChange={(e) =>
                    setBethkatiData({ ...bethkatiData, month: e.target.value })
                  }
                  className="w-[50%] rounded-lg bg-secondary p-3 text-lg text-textcolor placeholder-textcolor/70 focus:outline-none"
                />

                <Button onClick={handlePublishBethkati}>Publish</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
