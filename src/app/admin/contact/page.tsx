"use client";
import dayjs from "dayjs";
import { Mail, MailOpen, Phone } from "lucide-react";
import { useState } from "react";
import PageShell from "~/components/PageShell";
import ProtectedRoute from "~/components/ProtectRoute";
import { api } from "~/trpc/react";

export default function ContactInboxPage() {
  const utils = api.useUtils();
  const { data: inquiries = [], isLoading } = api.contact.getAll.useQuery();
  const [expanded, setExpanded] = useState<string | null>(null);
  const setRead = api.contact.setRead.useMutation({
    onSuccess: () => utils.contact.getAll.invalidate(),
  });
  const unread = inquiries.filter((item) => !item.isRead).length;

  const openInquiry = (id: string, isRead: boolean) => {
    setExpanded((current) => (current === id ? null : id));
    if (!isRead) setRead.mutate({ id, isRead: true });
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "DEVELOPER"]}>
      <PageShell
        admin
        title="Contact enquiries"
        description="Messages submitted through the public Contact Us page."
      >
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#211811]/90">
          <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold">Inbox</h2>
              <p className="mt-1 text-sm text-white/45">
                {unread ? `${unread} unread` : "All enquiries have been read"}
              </p>
            </div>
            <span className="grid h-11 min-w-11 place-items-center rounded-full bg-[#f0c878]/10 px-3 font-semibold text-[#f0c878]">
              {inquiries.length}
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse p-5 sm:p-7">
                    <div className="h-5 w-48 rounded bg-white/10" />
                    <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/[0.06]" />
                  </div>
                ))
              : inquiries.map((inquiry) => (
                  <article key={inquiry.id}>
                    <button
                      type="button"
                      onClick={() => openInquiry(inquiry.id, inquiry.isRead)}
                      className="grid w-full gap-4 p-5 text-left transition hover:bg-white/[0.025] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-7"
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full ${inquiry.isRead ? "bg-white/[0.05] text-white/35" : "bg-[#f0c878]/10 text-[#f0c878]"}`}
                      >
                        {inquiry.isRead ? (
                          <MailOpen size={18} />
                        ) : (
                          <Mail size={18} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <strong className="truncate">{inquiry.name}</strong>
                          <span className="text-sm text-[#f0c878]">
                            {inquiry.subject}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-sm text-white/45">
                          {inquiry.message}
                        </span>
                      </span>
                      <span className="text-xs text-white/35 sm:text-right">
                        {dayjs(inquiry.createdAt).format("D MMM YYYY, h:mm A")}
                      </span>
                    </button>
                    {expanded === inquiry.id && (
                      <div className="border-t border-white/[0.06] bg-black/15 px-5 pb-6 pt-5 sm:px-20 sm:pb-7">
                        <p className="whitespace-pre-wrap leading-7 text-white/70">
                          {inquiry.message}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#f0c878] px-4 text-sm font-semibold text-[#211811]"
                          >
                            <Mail size={15} /> Reply by email
                          </a>
                          {inquiry.phone && (
                            <a
                              href={`tel:${inquiry.phone}`}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/70"
                            >
                              <Phone size={15} /> {inquiry.phone}
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setRead.mutate({
                                id: inquiry.id,
                                isRead: !inquiry.isRead,
                              })
                            }
                            className="min-h-10 rounded-full border border-white/15 px-4 text-sm text-white/55"
                          >
                            Mark as {inquiry.isRead ? "unread" : "read"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
            {!isLoading && inquiries.length === 0 && (
              <div className="p-14 text-center text-white/45">
                No contact enquiries yet.
              </div>
            )}
          </div>
        </section>
      </PageShell>
    </ProtectedRoute>
  );
}
