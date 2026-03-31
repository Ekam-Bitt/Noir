"use client";

import Link from "next/link";

import { GradientPanel } from "@/components/ui/gradient-panel";
import { useCart } from "@/components/cart/cart-provider";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const { cart, error, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();

  return (
    <div
      className={`fixed inset-0 z-50 transition ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isDrawerOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/50 transition ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeDrawer}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#110f0e] p-6 shadow-2xl transition duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#8d7f73]">Bag</p>
            <h2 className="text-2xl font-semibold text-[#f5efe8]">Your selection</h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-[#2c2724] px-3 py-1 text-sm text-[#c7b9ab]"
            onClick={closeDrawer}
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {cart.lines.length ? (
            cart.lines.map((line) => (
              <div key={line.id} className="rounded-[1.5rem] border border-[#211d1a] bg-[#171412] p-4">
                <div className="flex gap-4">
                  <GradientPanel palette={line.accent} className="h-24 w-20 rounded-[1.3rem]" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#f5efe8]">{line.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8d7f73]">
                          {line.color} / {line.size}
                        </p>
                      </div>
                        <button
                          type="button"
                          className="text-xs uppercase tracking-[0.18em] text-[#8d7f73]"
                          onClick={() => {
                            void removeItem(line.id);
                          }}
                        >
                          Remove
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-[#322c29]">
                        <button
                          type="button"
                          className="px-3 py-1 text-[#f5efe8]"
                          onClick={() => {
                            void updateQuantity(line.id, line.quantity - 1);
                          }}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm text-[#f5efe8]">{line.quantity}</span>
                        <button
                          type="button"
                          className="px-3 py-1 text-[#f5efe8]"
                          onClick={() => {
                            void updateQuantity(line.id, line.quantity + 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm text-[#f5efe8]">{formatINR(line.quantity * line.unitPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#312b28] px-6 py-10 text-center">
              <p className="text-xl text-[#f5efe8]">Your bag is empty.</p>
              <p className="mt-2 text-sm text-[#9e9082]">Build your look from the latest drop.</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-[#27221f] bg-[#181513] p-5">
          {error ? <p className="mb-3 text-sm text-[#d79f8d]">{error}</p> : null}
          <div className="flex items-center justify-between text-sm text-[#c7b9ab]">
            <span>Estimated total</span>
            <span>{formatINR(cart.grandTotal)}</span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8d7f73]">
            Tax included. Shipping calculated at checkout.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/cart"
              className="flex-1 rounded-full border border-[#332d29] px-4 py-3 text-center text-sm font-medium text-[#f5efe8]"
              onClick={closeDrawer}
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              className="flex-1 rounded-full bg-[#f1ddc7] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#1a1715]"
              onClick={closeDrawer}
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
