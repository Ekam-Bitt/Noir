import Link from "next/link";

import { NewsletterForm } from "@/components/ui/newsletter-form";
import type { StoreSettings } from "@/lib/types";

export function Footer({ settings }: { settings: StoreSettings }) {
  const groups = [
    {
      title: "Explore",
      links: [
        { href: "/products", label: "Shop All" },
        { href: "/archive", label: "Archive" },
        { href: "/laboratory", label: "Laboratory" },
        { href: "/about", label: "About" },
        { href: "/faq", label: "FAQ" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/shipping", label: "Shipping & Returns" },
        { href: "/contact", label: "Contact" },
        { href: "/checkout", label: "Checkout" },
        { href: "/account", label: "Account" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[var(--brand-canvas)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_0.8fr] md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9b8c80]">Stay in the loop</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#f5efe8]">
            {settings.newsletterHeading}
          </h2>
          <div className="mt-6">
            <NewsletterForm placeholder={settings.newsletterPlaceholder} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm text-[#b7a99b]">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-[#f1ddc7]">{group.title}</p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block break-words text-sm leading-6 text-[#b7a99b] transition hover:text-[#f5efe8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
