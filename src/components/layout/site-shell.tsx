import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { AuthViewer } from "@/lib/auth/server";
import type { StoreSettings } from "@/lib/types";

export function SiteShell({
  children,
  settings,
  viewer,
}: {
  children: ReactNode;
  settings: StoreSettings;
  viewer: AuthViewer;
}) {
  return (
    <>
      <div className="border-b border-white/10 bg-[#161210] px-4 py-2 text-center text-[11px] uppercase tracking-[0.3em] text-[#c8b8a9]">
        {settings.announcement}
      </div>
      <Header settings={settings} viewer={viewer} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
    </>
  );
}
