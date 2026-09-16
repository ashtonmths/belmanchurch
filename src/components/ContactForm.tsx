"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";

const TOPICS = [
  "General enquiry",
  "Mass intention",
  "Sacraments",
  "Certificates & records",
  "Visiting the parish",
  "Other",
];

const MAX = 4000;

function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full rounded-2xl border border-accent/20 bg-white px-4 pb-2.5 pt-6 text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-primary/40"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 origin-left text-textcolor/60 transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
    </div>
  );
}

export default function ContactForm() {
  const submit = api.contact.submit.useMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submit.mutateAsync({
        name,
        email,
        phone: phone || undefined,
        subject: topic,
        message,
        website: website || undefined,
      });
      setSentTo(name.split(" ")[0] ?? name);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      // Shown below from submit.error
    }
  }

  if (sentTo) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-xl shadow-accent/10">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/40 text-accent motion-safe:animate-[pulse_1.5s_ease-out_1]">
          <CheckCircle2 size={44} aria-hidden />
        </span>
        <h2 className="mt-6 font-serif text-4xl font-semibold text-ink">Thank you, {sentTo}!</h2>
        <p className="mt-3 max-w-sm text-textcolor/80">
          Your message has reached the parish office. We&rsquo;ll reply to you by email as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            submit.reset();
          }}
          className="mt-8 font-semibold text-accent underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const tooShort = message.trim().length > 0 && message.trim().length < 10;

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-xl shadow-accent/10 md:p-10" noValidate={false}>
      <h2 className="font-serif text-3xl font-semibold text-ink">Send us a message</h2>
      <p className="mt-2 text-textcolor/75">We usually reply within a few working days.</p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-ink">What is it about?</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                topic === t
                  ? "bg-ink text-cream shadow"
                  : "border border-accent/20 bg-cream/60 text-ink hover:border-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FloatingField id="name" label="Your name" value={name} onChange={setName} required autoComplete="name" />
        <FloatingField id="email" label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <div className="sm:col-span-2">
          <FloatingField id="phone" label="Phone (optional)" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
        </div>
      </div>

      <div className="relative mt-4">
        <textarea
          id="message"
          required
          rows={6}
          maxLength={MAX}
          placeholder=" "
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="peer w-full resize-y rounded-2xl border border-accent/20 bg-white px-4 pb-3 pt-7 text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-primary/40"
        />
        <label
          htmlFor="message"
          className="pointer-events-none absolute left-4 top-4 text-textcolor/60 transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold"
        >
          Your message <span className="text-accent">*</span>
        </label>
        <span className="absolute bottom-3 right-4 text-xs text-textcolor/50">
          {message.length}/{MAX}
        </span>
      </div>
      {tooShort && <p className="mt-1 text-sm text-accent">Please write at least a sentence.</p>}

      {/* Honeypot: hidden from people and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {submit.error && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submit.error.data?.zodError
            ? "Please check your name, email and message, then try again."
            : submit.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submit.isPending}
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-accent disabled:opacity-60 sm:w-auto"
      >
        {submit.isPending ? (
          <Loader2 size={18} className="animate-spin" aria-hidden />
        ) : (
          <Send size={18} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        )}
        {submit.isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
