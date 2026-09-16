"use client";

import dayjs from "dayjs";
import { Mail, MailOpen, Phone, Reply } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Card,
  ConfirmButton,
  EmptyState,
  PageHeader,
  Spinner,
} from "~/components/admin/ui";
import { api } from "~/trpc/react";

export default function MessagesAdmin() {
  const utils = api.useUtils();
  const list = api.contact.adminList.useQuery();
  const refresh = () =>
    Promise.all([utils.contact.adminList.invalidate(), utils.contact.unreadCount.invalidate()]);
  const setRead = api.contact.setRead.useMutation({ onSuccess: refresh });
  const remove = api.contact.delete.useMutation({ onSuccess: refresh });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Messages sent through the Contact page on the website."
      />
      {list.isLoading ? (
        <Spinner />
      ) : !list.data?.length ? (
        <EmptyState>No messages yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {list.data.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id}>
                <Card className={`!p-0 ${m.read ? "" : "border-l-4 !border-l-accent"}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => {
                      setOpenId(open ? null : m.id);
                      if (!m.read) setRead.mutate({ id: m.id, read: true });
                    }}
                    className="flex w-full items-start gap-4 p-5 text-left"
                  >
                    {m.read ? (
                      <MailOpen size={20} className="mt-0.5 shrink-0 text-textcolor/50" aria-label="Read" />
                    ) : (
                      <Mail size={20} className="mt-0.5 shrink-0 text-accent" aria-label="Unread" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${m.read ? "text-ink" : "font-semibold text-ink"}`}>
                        {m.subject ?? "(no subject)"} · {m.name}
                      </span>
                      {!open && <span className="block truncate text-sm text-textcolor/70">{m.message}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-textcolor/60">
                      {dayjs(m.createdAt).format("D MMM, h:mm A")}
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-accent/10 px-5 pb-5 pt-4">
                      <p className="text-sm text-textcolor/80">
                        {m.email}
                        {m.phone && (
                          <>
                            {" · "}
                            <a className="inline-flex items-center gap-1 underline" href={`tel:${m.phone}`}>
                              <Phone size={12} /> {m.phone}
                            </a>
                          </>
                        )}
                      </p>
                      <p className="mt-3 whitespace-pre-line text-ink">{m.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Your message to St. Joseph Church, Belman"}`)}`}
                          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-accent"
                        >
                          <Reply size={16} /> Reply by email
                        </a>
                        <Button variant="secondary" onClick={() => setRead.mutate({ id: m.id, read: false })}>
                          Mark unread
                        </Button>
                        <ConfirmButton onConfirm={() => remove.mutateAsync({ id: m.id })} />
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
