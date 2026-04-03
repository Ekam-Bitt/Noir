import Link from "next/link";

import { NewsletterForm } from "@/components/ui/newsletter-form";
import type { StoreSettings } from "@/lib/types";

export function Footer({ settings }: { settings: StoreSettings }) {
  const primaryLinks = [
    { href: "/products", label: "Shop" },
    { href: "/collections", label: "Collection" },
    { href: "/archive", label: "Archive" },
    { href: "/about", label: "About" },
  ];

  const secondaryLinks = [
    { href: "/shipping", label: "Shipping" },
    { href: "/contact", label: "Contact" },
    { href: "/account", label: "Account" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <footer className="mt-16 border-t border-white/8 bg-[var(--brand-canvas)]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 border-b border-white/8 pb-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.58em] text-[#f1ddc7]">{settings.logoText}</p>
            <p className="mt-4 max-w-4xl text-[2.6rem] leading-[0.9] tracking-[-0.08em] text-[#f5efe8] md:text-[4.8rem]">
              PREMIUM
              <br />
              CHAPTERWEAR
            </p>
            <div className="mt-8 max-w-md">
              <NewsletterForm placeholder={settings.newsletterPlaceholder} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:pt-2">
            <nav aria-label="Primary footer">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#807468]">Explore</p>
              <ul className="mt-4 flex flex-col gap-3">
                {primaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] uppercase tracking-[0.2em] text-[#d0c1b1] transition hover:text-[#f5efe8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Secondary footer">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#807468]">Support</p>
              <ul className="mt-4 flex flex-col gap-3">
                {secondaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] uppercase tracking-[0.2em] text-[#d0c1b1] transition hover:text-[#f5efe8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[10px] uppercase tracking-[0.32em] text-[#6f655d] md:flex-row md:items-center md:justify-between">
          <p>{settings.brandName}</p>
          <p>Minimalist premium / loud identity</p>
        </div>
      </div>
    </footer>
  );
}
