"use client";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import PageShell from "~/components/PageShell";
import ThemedToast from "~/components/ThemedToast";
import { api } from "~/trpc/react";

const contacts = [
  {
    icon: Phone,
    title: "Call the parish office",
    value: "+91 91410 31604",
    detail: "For parish enquiries, certificates and appointments.",
    href: "tel:+919141031604",
    action: "Call now",
  },
  {
    icon: Mail,
    title: "Email us",
    value: "belmanchurch.in@gmail.com",
    detail: "Send general enquiries or information for the parish office.",
    href: "mailto:belmanchurch.in@gmail.com",
    action: "Write an email",
  },
  {
    icon: MapPin,
    title: "Visit the church",
    value: "St. Joseph Church, Belman",
    detail: "Belman, Udupi District, Karnataka.",
    href: "https://www.google.com/maps/search/?api=1&query=St+Joseph+Church+Belman",
    action: "Get directions",
  },
];

const enquirySubjects = [
  "General enquiry",
  "Parish certificate",
  "Sacrament or service",
  "Website or gallery",
] as const;

type EnquirySubject = (typeof enquirySubjects)[number];

export default function ContactPage() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: EnquirySubject;
    message: string;
    website: string;
  }>({
    name: "",
    email: "",
    phone: "",
    subject: "General enquiry",
    message: "",
    website: "",
  });
  const submit = api.contact.create.useMutation({
    onSuccess: ({ emailSent }) => {
      toast.success(
        emailSent
          ? "Your message was sent to the parish office"
          : "Your message was saved for the parish office",
      );
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "General enquiry",
        message: "",
        website: "",
      });
    },
    onError: () => toast.error("Your message could not be sent. Try again."),
  });
  const inputClass =
    "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#f0c878]";

  return (
    <PageShell
      title="Contact us"
      description="Reach the parish office by phone, email or visit us in Belman."
    >
      <ThemedToast />
      <section className="mb-5 grid gap-7 rounded-3xl border border-white/10 bg-[#211811]/90 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
        <div>
          <h2 className="text-2xl font-semibold">Send an enquiry</h2>
          <p className="mt-3 leading-7 text-white/50">
            Your message will be available to the parish office in the admin
            panel. A notification is also sent by email.
          </p>
        </div>
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit.mutate(form);
          }}
        >
          <label className="text-sm text-white/60">
            Name
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/60">
            Email
            <input
              required
              type="email"
              maxLength={254}
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/60">
            Phone <span className="text-white/30">(optional)</span>
            <input
              type="tel"
              maxLength={20}
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/60">
            Enquiry about
            <select
              value={form.subject}
              onChange={(event) =>
                setForm({
                  ...form,
                  subject: event.target.value as EnquirySubject,
                })
              }
              className={inputClass}
            >
              {enquirySubjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
          <label className="hidden" aria-hidden="true">
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) =>
                setForm({ ...form, website: event.target.value })
              }
            />
          </label>
          <label className="text-sm text-white/60 sm:col-span-2">
            Message
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={6}
              value={form.message}
              onChange={(event) =>
                setForm({ ...form, message: event.target.value })
              }
              className={`${inputClass} resize-y`}
            />
          </label>
          <div className="sm:col-span-2 sm:text-right">
            <button
              type="submit"
              disabled={submit.isPending}
              className="min-h-12 w-full rounded-full bg-[#f0c878] px-7 font-semibold text-[#211811] transition hover:bg-[#e7bb64] disabled:opacity-50 sm:w-auto"
            >
              {submit.isPending ? "Sending…" : "Send enquiry"}
            </button>
          </div>
        </form>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        {contacts.map(({ icon: Icon, title, value, detail, href, action }) => (
          <article
            key={title}
            className="flex min-h-72 flex-col rounded-3xl border border-white/10 bg-[#211811]/90 p-6 sm:p-8"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f0c878]/10 text-[#f0c878]">
              <Icon size={21} />
            </span>
            <h2 className="mt-6 text-xl font-semibold">{title}</h2>
            <p className="mt-2 break-words text-white/80">{value}</p>
            <p className="mt-3 text-sm leading-6 text-white/50">{detail}</p>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="mt-auto pt-7 font-semibold text-[#f0c878] underline decoration-[#f0c878]/30 underline-offset-4"
            >
              {action}
            </a>
          </article>
        ))}
      </div>
      <section className="mt-5 flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#211811]/90 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex gap-4">
          <Clock3 className="mt-1 shrink-0 text-[#f0c878]" size={22} />
          <div>
            <h2 className="text-xl font-semibold">Parish office hours</h2>
            <p className="mt-2 leading-7 text-white/55">
              Monday to Saturday, 9:00 AM–1:00 PM and 2:00 PM–5:00 PM. Closed on
              Sunday.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
