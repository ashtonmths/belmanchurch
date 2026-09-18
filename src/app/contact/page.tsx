import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import PageShell from "~/components/PageShell";

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

export default function ContactPage() {
  return (
    <PageShell
      title="Contact us"
      description="Reach the parish office by phone, email or visit us in Belman."
    >
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
