"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { GradientPanel } from "@/components/ui/gradient-panel";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { cart, error, updateQuantity, removeItem, applyPromoCode } = useCart();
  const [promo, setPromo] = useState(cart.promoCode ?? "");

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#9e9082]">
          <span className="text-[#f5efe8]">Cart</span>
          <span>/</span>
          <Link href="/checkout" className="transition hover:text-[#f5efe8]">
            Checkout
          </Link>
          <span>/</span>
          <span>Payment</span>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.lines.length ? (
            cart.lines.map((line) => (
              <div key={line.id} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {line.image ? (
                    <div className="relative h-44 w-full flex-shrink-0 overflow-hidden rounded-[1.5rem] sm:w-36">
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 640px) 144px, 100vw"
                      />
                    </div>
                  ) : (
                    <GradientPanel palette={line.accent} className="h-44 w-full rounded-[1.5rem] sm:w-36" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-2xl tracking-[-0.03em] text-[#f5efe8]">{line.name}</p>
                        <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#9e9082]">
                          {line.color} / {line.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-[#9e9082]"
                        onClick={() => {
                          void removeItem(line.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex w-fit items-center rounded-full border border-[#332d29]">
                        <button
                          type="button"
                          className="px-4 py-2 text-[#f5efe8]"
                          onClick={() => {
                            void updateQuantity(line.id, line.quantity - 1);
                          }}
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          className="px-4 py-2 text-[#f5efe8]"
                          onClick={() => {
                            void updateQuantity(line.id, line.quantity + 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-lg text-[#f5efe8]">{formatINR(line.unitPrice * line.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#2f2926] px-6 py-16 text-center">
              <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">Your bag is empty.</p>
              <p className="mt-3 text-[#a7988b]">Browse products and add something you like.</p>
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
              >
                Shop now
              </Link>
            </div>
          )}
        </div>

        <aside className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6 lg:sticky lg:top-28 lg:h-fit">
          <h2 className="text-3xl tracking-[-0.04em] text-[#f5efe8]">Cart</h2>
          {error ? <p className="mt-4 text-sm text-[#d79f8d]">{error}</p> : null}
          <div className="mt-6 space-y-3 text-sm text-[#c7b9ab]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatINR(cart.discountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.shippingFee === 0 ? "Free" : formatINR(cart.shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatINR(cart.taxTotal)}</span>
            </div>
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-[#2b2623] p-4">
            <label className="text-xs uppercase tracking-[0.22em] text-[#9e9082]">Promo code</label>
            <div className="mt-3 flex gap-3">
              <input
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
                placeholder="NOIR10"
                className="min-w-0 flex-1 rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  void applyPromoCode(promo);
                }}
                className="rounded-full border border-[#312a26] px-4 py-3 text-sm text-[#f5efe8]"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#241f1d] pt-6 text-lg">
            <span>Estimated total</span>
            <span>{formatINR(cart.grandTotal)}</span>
          </div>
          <p className="mt-3 text-sm text-[#9e9082]">Tax included. Shipping calculated at checkout.</p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-[#f1ddc7] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#1a1715]"
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
