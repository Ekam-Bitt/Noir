"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { AuthViewer } from "@/lib/auth/server";
import { adminNavigation, customerNavigation, storefrontNavigation } from "@/lib/data/store";
import type { StoreSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Header({ settings, viewer }: { settings: StoreSettings; viewer: AuthViewer }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cart, openDrawer } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = viewer.isAdmin;
  const isCustomerArea = viewer.isAuthenticated && !viewer.isAdmin;
  const navigation = isAdmin
    ? adminNavigation
    : isCustomerArea
      ? [...storefrontNavigation, ...customerNavigation]
      : storefrontNavigation;
  const cartCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

  const isLinkActive = (href: string) => {
    const [hrefPathname, hrefSearch] = href.split("?");
    if (pathname !== hrefPathname) return false;

    if (!hrefSearch) {
      const categoryParams = ["category", "subcategory", "sort"];
      return !categoryParams.some((param) => searchParams.has(param));
    }

    const params = new URLSearchParams(hrefSearch);
    return Array.from(params.entries()).every(([key, value]) => searchParams.get(key) === value);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0908]/96">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        {!isAdmin ? (
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-10 min-w-10 items-center justify-center border border-white/10 px-3 text-[10px] uppercase tracking-[0.34em] text-[#f5efe8] lg:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>
        ) : (
          <div className="w-10 lg:w-24" />
        )}

        <div className="flex min-w-0 flex-1 items-center justify-center lg:justify-start">
          <Link href="/" className="flex flex-col items-center gap-1 lg:items-start">
            <span className="text-[12px] uppercase tracking-[0.58em] text-[#f1ddc7]">{settings.logoText}</span>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-6 xl:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[10px] uppercase tracking-[0.28em] transition hover:text-[#f5efe8]",
                isLinkActive(item.href) ? "text-[#f5efe8]" : "text-[#8f8377]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {isAdmin ? (
          <div className="flex flex-1 justify-end">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.28em] text-[#c5b7a7] transition hover:text-[#f5efe8]"
            >
              Storefront
            </Link>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-end gap-3">
            {viewer.isAuthenticated ? (
              <Link
                href="/account"
                className="hidden text-[10px] uppercase tracking-[0.28em] text-[#9e9082] transition hover:text-[#f5efe8] md:inline-flex"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden text-[10px] uppercase tracking-[0.28em] text-[#9e9082] transition hover:text-[#f5efe8] md:inline-flex"
              >
                Sign In
              </Link>
            )}
            <button
              type="button"
              onClick={openDrawer}
              className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#f5efe8] transition hover:border-[#f1ddc7]"
            >
              Cart {cartCount}
            </button>
          </div>
        )}
      </div>

      {!isAdmin ? (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/60 transition lg:hidden",
            isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={!isMenuOpen}
        >
          <button type="button" className="absolute inset-0" onClick={() => setIsMenuOpen(false)} aria-label="Close menu" />
          <div
            className={cn(
              "absolute inset-x-0 top-0 border-b border-white/10 bg-[#0b0908] px-5 pb-8 pt-5 transition duration-300",
              isMenuOpen ? "translate-y-0" : "-translate-y-full",
            )}
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <p className="text-[12px] uppercase tracking-[0.58em] text-[#f1ddc7]">{settings.logoText}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-[#f5efe8]"
              >
                Close
              </button>
            </div>

            <nav className="mt-5 flex flex-col">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "border-b border-white/8 py-4 text-[14px] uppercase tracking-[0.22em] transition hover:text-[#f5efe8]",
                    isLinkActive(item.href) ? "text-[#f5efe8]" : "text-[#a39587]",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 flex gap-3">
              <Link
                href={viewer.isAuthenticated ? "/account" : "/auth/login"}
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 border border-white/10 px-4 py-3 text-center text-[10px] uppercase tracking-[0.28em] text-[#f5efe8]"
              >
                {viewer.isAuthenticated ? "Profile" : "Sign In"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openDrawer();
                }}
                className="flex-1 bg-[#f1ddc7] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#171311]"
              >
                Cart {cartCount}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
