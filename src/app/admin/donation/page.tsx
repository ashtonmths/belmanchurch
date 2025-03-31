"use client";
import Image from "next/image";
import React, { useState } from "react";
import { api } from "~/trpc/react";

type ReceiptUploaderProps = {
  id: string;
};

export default function DonationAdmin() {
  const { data: inboxDonations = [], refetch: refetchInbox } =
    api.donation.getInbox.useQuery();
  const { data: historyDonations = [], refetch: refetchHistory } =
    api.donation.getHistory.useQuery();

  const issueReceipt = api.donation.issueReceipt.useMutation({
    onSuccess: async () => {
      await refetchInbox(); // Refresh Inbox
      await refetchHistory(); // Refresh History
    },
  });
  const [receipt, setReceipt] = useState<
    Record<
      string,
      {
        data: string;
        method: "upload";
        type: string;
      }
    >
  >({});

  const [activeTab, setActiveTab] = useState<"inbox" | "history">("inbox");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInboxDonations = inboxDonations.filter((donation) =>
    donation.byWhom.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredHistoryDonations = historyDonations.filter((donation) =>
    donation.byWhom.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ id }) => {
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        const buffer = Buffer.from(e.target.result as ArrayBuffer).toString(
          "base64",
        );

        setReceipt((prev) => ({
          ...prev,
          [id]: {
            data: `data:${file.type};base64,${buffer}`,
            method: "upload",
            type: file.type,
          },
        }));
      };
      reader.readAsArrayBuffer(file);
    };

    return (
      <div>
        <input type="file" accept=".pdf,.png,.jpg" onChange={handleUpload} />
      </div>
    );
  };

  const handleSend = async (id: string, email: string) => {
    if (!receipt[id]) {
      alert("No receipt found for this donation.");
      return;
    }

    try {
      await issueReceipt.mutateAsync({
        id,
        email,
        method: receipt[id].method,
        file: {
          name: `receipt_${id}.${receipt[id].type.split("/")[1]}`,
          buffer: receipt[id].data,
        },
      });

      alert("Receipt sent successfully!");
    } catch (error) {
      console.error("Error sending receipt:", error);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-[url('/bg/home.jpg')] bg-cover bg-center">
      <div className="flex h-screen w-full items-end justify-center bg-black/50 backdrop-blur-sm">
        <div className="mb-5 flex h-[81%] w-[90%] flex-col items-center overflow-auto rounded-xl border-4 border-primary bg-black/40 p-5 text-center">
          <div className="mb-8 flex w-full justify-center gap-4">
            <button
              className={`rounded-lg px-4 py-2 font-semibold ${activeTab === "inbox" ? "bg-primary text-textcolor" : "bg-secondary text-textcolor"}`}
              onClick={() => setActiveTab("inbox")}
            >
              Inbox
            </button>
            <button
              className={`rounded-lg px-4 py-2 font-semibold ${activeTab === "history" ? "bg-primary text-textcolor" : "bg-secondary text-textcolor"}`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <input
              type="text"
              placeholder={`Search ${activeTab === "inbox" ? "Inbox" : "History"} by donor...`}
              className="w-[25%] font-semibold rounded-lg border border-accent bg-primary placeholder-accent px-4 py-2 text-textcolor focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === "inbox" && (
            <div className="flex h-full w-[70%] flex-col items-center gap-3 overflow-y-auto rounded p-3">
              {inboxDonations.length === 0 ? (
                <p className="text-4xl font-extrabold text-primary">
                  No pending receipts.
                </p>
              ) : (
                <table className="w-full table-fixed border-collapse rounded-xl">
                  <thead>
                    <tr className="border-2 border-accent bg-primary text-textcolor">
                      <th className="border-2 border-accent p-2">Type</th>
                      <th className="border-2 border-accent p-2">For?</th>
                      <th className="border-2 border-accent p-2">By?</th>
                      <th className="border-2 border-accent p-2">Amount</th>
                      <th className="border-2 border-accent p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInboxDonations.map((donation) => (
                      <React.Fragment key={donation.id}>
                        {/* Row with donation details */}
                        <tr className="border-2 border-accent bg-primary font-bold text-textcolor">
                          <td className="border-2 border-accent p-2">
                            {donation.type}
                          </td>
                          <td className="border-2 border-accent p-2">
                            {donation.forWhom}
                          </td>
                          <td className="border-2 border-accent p-2">
                            {donation.byWhom}
                          </td>
                          <td className="border-2 border-accent p-2">
                            ₹{donation.amount}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              className="rounded border-2 border-accent bg-primary px-4 py-2 text-textcolor hover:bg-accent hover:text-primary transition-all duration-300 ease-in-out"
                              onClick={() =>
                                setExpandedRow((prev) =>
                                  prev === donation.id ? null : donation.id,
                                )
                              }
                            >
                              {expandedRow === donation.id ? "Close" : "Upload"}
                            </button>
                          </td>
                        </tr>

                        {expandedRow === donation.id && (
                          <tr className="transition-all duration-300 ease-in-out">
                            <td colSpan={5} className="border bg-primary p-3">
                              {!receipt[donation.id] ? (
                                <ReceiptUploader id={donation.id} />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Image
                                    src={receipt[donation.id]?.data ?? "/favicon.webp"}
                                    alt="Scanned Receipt"
                                    className="mt-2 h-40 w-auto rounded object-cover"
                                    width={300}
                                    height={200}
                                  />
                                  <div className="flex flex-row items-center justify-center gap-2">
                                    <button
                                      className="mt-2 rounded-full bg-green-500 px-4 py-2 text-white"
                                      onClick={() =>
                                        handleSend(donation.id, donation.email)
                                      }
                                    >
                                      Send
                                    </button>
                                    <button
                                      className="mt-2 rounded-full bg-red-500 px-4 py-2 text-white"
                                      onClick={() =>
                                        setReceipt((prev) => {
                                          const updated = { ...prev };
                                          delete updated[donation.id];
                                          return updated;
                                        })
                                      }
                                    >
                                      Reset
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex h-full w-[70%] flex-col items-center gap-3 overflow-y-auto rounded p-3">
              {filteredHistoryDonations.length === 0 ? (
                <p className="text-4xl font-extrabold text-primary">
                  No receipts issued.
                </p>
              ) : (
                <table className="w-full table-fixed border-collapse rounded-xl">
                  <thead>
                    <tr className="border-2 border-accent bg-primary text-textcolor">
                      <th className="border-2 border-accent p-2">Type</th>
                      <th className="border-2 border-accent p-2">By?</th>
                      <th className="border-2 border-accent p-2">Amount</th>
                      <th className="border-2 border-accent p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyDonations.map((donation) => (
                      <tr
                        key={donation.id}
                        className="border-2 border-accent bg-primary font-semibold text-textcolor"
                      >
                        <td className="border-2 border-accent p-2">
                          {donation.type}
                        </td>
                        <td className="border-2 border-accent p-2">
                          {donation.byWhom}
                        </td>
                        <td className="border-2 border-accent p-2">
                          ₹{donation.amount}
                        </td>
                        <td className="border-2 border-accent p-2 font-bold text-green-700">
                          Receipt Issued ✅
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
