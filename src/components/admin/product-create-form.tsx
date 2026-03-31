"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const initialState = {
  name: "",
  slug: "",
  category: "Unisex",
  subcategory: "Tops",
  collection: "New Chapter",
  price: "2990",
  compareAtPrice: "",
  description: "",
  fit: "Oversized",
  fabric: "",
  story: "",
  modelInfo: "",
  shippingNote: "Ships in 24 hours.",
  colors: "Noir",
  sizes: "S,M,L",
  tags: "New,Featured",
  initialStock: "5",
};

export function ProductCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  return (
    <form
      className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
            colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
            sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
            tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
            initialStock: Number(form.initialStock),
          }),
        });

        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setMessage(data.error ?? "Unable to create product.");
          setSubmitting(false);
          return;
        }

        setForm(initialState);
        setMessage("Product created.");
        setSubmitting(false);
        router.refresh();
      }}
    >
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Create product</p>
        <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">Add a new item to the catalogue</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["name", "Name"],
          ["slug", "Slug"],
          ["collection", "Collection"],
          ["price", "Price"],
          ["compareAtPrice", "Compare-at price"],
          ["fabric", "Fabric"],
          ["modelInfo", "Model info"],
          ["shippingNote", "Shipping note"],
          ["colors", "Colors (comma separated)"],
          ["sizes", "Sizes (comma separated)"],
          ["tags", "Tags (comma separated)"],
          ["initialStock", "Initial stock per variant"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={form[key as keyof typeof form]}
            onChange={(event) =>
              setForm((current) => ({ ...current, [key]: event.target.value }))
            }
            placeholder={label}
            className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
          />
        ))}
        <select
          value={form.category}
          onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          className="rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none"
        >
          <option>Men</option>
          <option>Women</option>
          <option>Unisex</option>
        </select>
        <select
          value={form.subcategory}
          onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))}
          className="rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none"
        >
          <option>Tops</option>
          <option>Bottoms</option>
          <option>Accessories</option>
        </select>
        <select
          value={form.fit}
          onChange={(event) => setForm((current) => ({ ...current, fit: event.target.value }))}
          className="rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none md:col-span-2"
        >
          <option>Oversized</option>
          <option>Regular</option>
          <option>Relaxed</option>
        </select>
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Description"
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.story}
          onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))}
          placeholder="Story"
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715] disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create product"}
        </button>
        {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
      </div>
    </form>
  );
}
