import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/cart/cart-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { getAuthViewer } from "@/lib/auth/server";
import { getStoreSettings } from "@/lib/services/content";
import type { CSSProperties } from "react";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://noirchapter.example"),
  title: {
    default: "Noir Chapter | Premium Clothing Brand",
    template: "%s | Noir Chapter",
  },
  description:
    "India-first premium fashion storefront with editorial storytelling, refined essentials, and cinematic collection drops.",
  openGraph: {
    title: "Noir Chapter | Premium Clothing Brand",
    description:
      "Shop elevated essentials, capsule collections, and story-driven fashion drops crafted for modern city wardrobes.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, viewer] = await Promise.all([getStoreSettings(), getAuthViewer()]);

  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0f0c0b] text-[#f5efe8]">
        <CartProvider>
          <div
            style={
              {
                "--brand-canvas": settings.brandCanvas,
                "--brand-ink": settings.brandInk,
                "--brand-accent": settings.brandAccent,
              } as CSSProperties
            }
          >
            <SiteShell settings={settings} viewer={viewer}>
              {children}
            </SiteShell>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
