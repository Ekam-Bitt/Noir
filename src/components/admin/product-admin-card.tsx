"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProductDetail, ProductImage } from "@/lib/types";

export function ProductAdminCard({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(String(product.compareAtPrice ?? ""));
  const [collection, setCollection] = useState(product.collection);
  const [images, setImages] = useState<ProductImage[]>(product.images);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [stock, setStock] = useState<Record<string, string>>(
    Object.fromEntries(product.variants.map((variant) => [variant.id, String(variant.stock)])),
  );

  async function save() {
    setMessage(null);
    let nextImages = images;

    if (pendingFiles.length > 0) {
      try {
        const uploaded = await Promise.all(
          pendingFiles.map(async (file, index) => {
            const body = new FormData();
            body.append("productSlug", product.slug);
            body.append("label", `Gallery ${images.length + index + 1}`);
            body.append("file", file);

            const response = await fetch("/api/admin/uploads/product-image", {
              method: "POST",
              body,
            });
            const data = (await response.json()) as { error?: string; image?: ProductImage };
            if (!response.ok || !data.image) {
              throw new Error(data.error ?? `Unable to upload ${file.name}.`);
            }
            return data.image;
          }),
        );

        nextImages = [...images, ...uploaded];
        setImages(nextImages);
        setPendingFiles([]);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to upload images.");
        return;
      }
    }

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
        images: nextImages,
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

      <div className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-[1.4rem] border border-[#2f2926] bg-[#171311]">
              {image.url ? (
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={image.url}
                    alt={image.alt ?? image.label}
                    fill
                    sizes="(max-width: 1280px) 50vw, 20vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="aspect-[4/5] w-full"
                  style={{
                    backgroundImage: `radial-gradient(circle at top left, ${image.palette[2]}, transparent 35%), linear-gradient(135deg, ${image.palette[0]}, ${image.palette[1]})`,
                  }}
                />
              )}
              <div className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#9e9082]">{image.label}</div>
            </div>
          ))}
        </div>

        <label className="block rounded-[1.5rem] border border-dashed border-[#312a26] px-4 py-4">
          <span className="mb-3 block text-xs uppercase tracking-[0.22em] text-[#9e9082]">Add product images</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            onChange={(event) => setPendingFiles(Array.from(event.target.files ?? []))}
            className="block w-full text-sm text-[#c7b9ab] file:mr-4 file:rounded-full file:border-0 file:bg-[#f1ddc7] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-[#1a1715]"
          />
          {pendingFiles.length ? (
            <p className="mt-3 text-sm text-[#c7b9ab]">{pendingFiles.length} image(s) ready to upload on save</p>
          ) : (
            <p className="mt-3 text-sm text-[#8d7f73]">Hosted in Supabase Storage and attached to this product on save.</p>
          )}
        </label>
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
