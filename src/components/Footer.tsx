import Link from "next/link";
import { PARISH } from "~/lib/parish";

const SECTIONS = [
  { name: "Home", href: "/" },
  { name: "Our story", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Notices", href: "/notices" },
  { name: "Gallery", href: "/gallery" },
  { name: "Bethkati", href: "/bethkati" },
  { name: "St. Anthony's Shrine", href: "/shrine" },
  { name: "Associations", href: "/associations" },
  { name: "Commissions", href: "/commissions" },
  { name: "Institutions", href: "/institutions" },
  { name: "Places to visit", href: "/tourism" },
  { name: "Contact", href: "/contact" },
  { name: "Donate", href: "/donate" },
];

/**
 * Server-rendered footer. Besides being useful to readers, this gives every
 * page a crawlable link to every other section and states the parish's
 * name, address and phone in the initial HTML — the basics of local search.
 */
export default function Footer() {
  const { address } = PARISH;
  const addressLines = [
    address.street,
    [address.locality, address.district].filter(Boolean).join(", "),
    [address.region, address.postalCode].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <footer className="border-t border-white/10 bg-ink px-6 py-16 text-primary">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-cream">{PARISH.name}</h2>
          <address className="mt-3 not-italic leading-relaxed text-primary/80">
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a
              href={`tel:${PARISH.phone}`}
              className="underline underline-offset-4 hover:text-white"
            >
              {PARISH.phoneDisplay}
            </a>
            <br />
            <a
              href={`mailto:${PARISH.email}`}
              className="underline underline-offset-4 hover:text-white"
            >
              {PARISH.email}
            </a>
          </address>
          <p className="mt-3 text-sm text-primary/60">
            Serving the Belman community since {PARISH.founded}.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-serif text-2xl font-semibold text-cream">Explore</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="underline underline-offset-4 hover:text-white"
                >
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-10 max-w-5xl text-sm text-primary/60">
        &copy; {new Date().getFullYear()} {PARISH.name}. All rights reserved.
      </p>
    </footer>
  );
}
