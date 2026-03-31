"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProductDetail } from "@/lib/types";

export function ProductAdminCard({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(String(product.compareAtPrice ?? ""));
  const [collection, setCollection] = useState(product.collection);
  const [stock, setStock] = useState<Record<string, string>>(
    Object.fromEntries(product.variants.map((variant) => [variant.id, String(variant.stock)])),
  );

  async function save() {
    setMessage(null);
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        variantStock: Object.fromEntries(
          Object.entries(stock).map(([variantId, value]) => [variantId, Number(value)]),
        ),
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Unable to save.");
      return;
    }
    setMessage("Saved.");
    router.refresh();
  }

  async function remove() {
    setMessage(null);
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Unable to delete.");
      return;
    }
    router.refresh();
  }

  return (
    <article className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">{product.category} / {product.subcategory}</p>
          <h3 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">{product.name}</h3>
          <p className="mt-2 text-sm text-[#b9ab9d]">{product.slug}</p>
        </div>
        <div className="text-sm text-[#c7b9ab]">
          <p>{product.variants.length} variants</p>
          <p>{product.variants.reduce((sum, variant) => sum + variant.stock, 0)} units total</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <input
          value={collection}
          onChange={(event) => setCollection(event.target.value)}
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <input
          value={compareAtPrice}
          onChange={(event) => setCompareAtPrice(event.target.value)}
          placeholder="Compare-at price"
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {product.variants.map((variant) => (
          <label key={variant.id} className="rounded-[1.4rem] border border-[#2f2926] p-4">
            <span className="block text-sm text-[#f5efe8]">{variant.color} / {variant.size}</span>
            <input
              value={stock[variant.id] ?? "0"}
              onChange={(event) =>
                setStock((current) => ({ ...current, [variant.id]: event.target.value }))
              }
              className="mt-3 w-full rounded-full border border-[#312a26] bg-transparent px-4 py-2 text-sm outline-none"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => {
            void save();
          }}
          className="rounded-full bg-[#f1ddc7] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={() => {
            void remove();
          }}
          className="rounded-full border border-[#5a312e] px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#e4b3a8]"
        >
          Delete
        </button>
        {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
      </div>
    </article>
  );
}
