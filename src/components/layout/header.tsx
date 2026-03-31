"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation, customerNavigation, storefrontNavigation } from "@/lib/data/store";
import type { AuthViewer } from "@/lib/auth/server";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import type { StoreSettings } from "@/lib/types";

export function Header({ settings, viewer }: { settings: StoreSettings; viewer: AuthViewer }) {
  const pathname = usePathname();
  const { cart, openDrawer } = useCart();
  const isAdmin = viewer.isAdmin;
  const isCustomerArea = viewer.isAuthenticated && !viewer.isAdmin;
  const navigation = isAdmin
    ? adminNavigation
    : isCustomerArea
      ? [...storefrontNavigation, ...customerNavigation]
      : storefrontNavigation;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#110f0e]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:gap-6 md:px-8">
        <Link href="/" className="min-w-0 flex items-center gap-2.5 md:gap-3">
          <span className="text-[11px] uppercase tracking-[0.38em] text-[#f1ddc7]">{settings.logoText}</span>
          <span className="hidden min-w-0 truncate text-sm text-[#8d7f73] sm:inline">{settings.brandTagline}</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition hover:text-[#f5efe8]",
                pathname === item.href ? "text-[#f5efe8]" : "text-[#a29486]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {isAdmin ? (
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <Link href="/" className="text-sm text-[#c5b7a7] transition hover:text-[#f5efe8]">
              Storefront
            </Link>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {viewer.isAuthenticated ? (
              <Link href="/account" className="text-sm text-[#c5b7a7] transition hover:text-[#f5efe8]">
                Profile
              </Link>
            ) : (
              <Link href="/auth/login" className="text-sm text-[#c5b7a7] transition hover:text-[#f5efe8]">
                Sign In
              </Link>
            )}
            <button
              type="button"
              onClick={openDrawer}
              className="rounded-full border border-[#302a27] px-3 py-2 text-sm text-[#f5efe8] md:px-4"
            >
              Cart ({cart.lines.reduce((sum, line) => sum + line.quantity, 0)})
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
