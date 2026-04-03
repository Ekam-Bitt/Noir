"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { ProductDetail, ProductImage } from "@/lib/types";
import { isSupabaseStorageUrl } from "@/lib/utils";

function toLocalDateTimeValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16.862 4.487a2.25 2.25 0 113.182 3.182L8.25 19.463 4 20l.537-4.25L16.862 4.487z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M6 7h12M9 7V5.75A1.75 1.75 0 0110.75 4h2.5A1.75 1.75 0 0115 5.75V7m-7 0v11A2 2 0 0010 20h4a2 2 0 002-2V7" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function ProductAdminCard({ product }: { product: ProductDetail }) {
  const [isOpen, setOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(String(product.compareAtPrice ?? ""));
  const [status, setStatus] = useState(product.status);
  const [launchAt, setLaunchAt] = useState(toLocalDateTimeValue(product.launchAt));
  const [description, setDescription] = useState(product.description);
  const [fabric, setFabric] = useState(product.fabric);
  const [modelInfo, setModelInfo] = useState(product.modelInfo);
  const [shippingNote, setShippingNote] = useState(product.shippingNote);
  const [images, setImages] = useState<ProductImage[]>(product.images);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [stock, setStock] = useState<Record<string, string>>(
    Object.fromEntries(product.variants.map((variant) => [variant.id, String(variant.stock)])),
  );
  const [now, setNow] = useState(() => Date.now());

  const showScheduleField = status === "draft";
  const totalUnits = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const pendingPreviews = useMemo(
    () => pendingFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [pendingFiles],
  );

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [pendingPreviews]);

  useEffect(() => {
    if (!showScheduleField || !launchAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [showScheduleField, launchAt]);

  const launchCountdown = useMemo(() => {
    if (!showScheduleField || !launchAt) return "";
    const target = new Date(launchAt).getTime();
    if (Number.isNaN(target)) return "";
    const delta = target - now;
    if (delta <= 0) return "Launch time reached. This piece is ready to go live automatically.";
    const totalSeconds = Math.floor(delta / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `Auto-launch in ${[days ? `${days}d` : null, `${hours}h`, `${minutes}m`, `${seconds}s`].filter(Boolean).join(" ")}`;
  }, [launchAt, now, showScheduleField]);

  async function save() {
    setSaving(true);
    setMessage(null);
    let nextImages = images;

    if (pendingFiles.length > 0) {
      try {
        const uploaded = await Promise.all(
          pendingFiles.map(async (file) => {
            const body = new FormData();
            body.append("productSlug", product.slug);
            body.append("label", "Image");
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
        setSaving(false);
        return;
      }
    }

    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        launchAt: showScheduleField && launchAt ? new Date(launchAt).toISOString() : null,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        description,
        fabric,
        modelInfo,
        shippingNote,
        variantStock: Object.fromEntries(
          Object.entries(stock).map(([variantId, value]) => [variantId, Number(value)]),
        ),
        images: nextImages,
      }),
    });
    const data = (await response.json()) as { error?: string | string[] };
    if (!response.ok) {
      setMessage(Array.isArray(data.error) ? data.error.join(" ") : data.error ?? "Unable to save.");
      setSaving(false);
      return;
    }

    setMessage("Saved.");
    setSaving(false);
    setEditing(false);
  }

  async function remove() {
    setDeleting(true);
    setMessage(null);
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Unable to delete.");
      setDeleting(false);
      return;
    }
    window.location.reload();
  }

  const imageTiles = [
    ...images.map((image) => ({ kind: "saved" as const, id: image.id, image, previewUrl: image.url })),
    ...pendingPreviews.map((preview, index) => ({
      kind: "pending" as const,
      id: `${preview.file.name}-${preview.file.lastModified}-${index}`,
      image: null,
      previewUrl: preview.url,
      fileIndex: index,
    })),
  ];

  return (
    <article className="rounded-[2rem] border border-[#26211f] bg-[#120f0d]">
      <div className="flex items-start gap-4 px-6 py-5">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-start gap-4 text-left"
        >
          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[1rem] bg-[#181311]">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={isSupabaseStorageUrl(product.images[0].url)}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">
                {product.category} / {product.subcategory}
              </p>
              <span className="rounded-full border border-[#312a26] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#c7b9ab]">
                {product.status}
              </span>
            </div>
            <h3 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">{product.name}</h3>
            <p className="mt-2 text-sm text-[#b9ab9d]">{product.slug}</p>
            <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-7 text-[#9f9184]">{product.description}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.18em] text-[#807468]">
              <span>Collection: {product.collection || "Unassigned"}</span>
              <span>{product.variants.length} variants</span>
              <span>{totalUnits} units</span>
            </div>
          </div>
          <div className="pt-2 text-[#8d7f73]">
            <ChevronIcon open={isOpen} />
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setEditing((current) => !current);
            }}
            className="rounded-full border border-[#312a26] p-3 text-[#f1ddc7] transition hover:border-[#f1ddc7]/35"
            aria-label="Edit product"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={() => {
              void remove();
            }}
            disabled={isDeleting}
            className="rounded-full border border-[#4a2d2a] p-3 text-[#e4b3a8] transition hover:border-[#e4b3a8]/45 disabled:opacity-50"
            aria-label="Delete product"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-[#26211f] px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-[#2f2926] bg-[#151210] px-4 py-4 text-sm text-[#c0b2a4]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Collection</p>
              <p className="mt-2">{product.collection || "Unassigned"}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#2f2926] bg-[#151210] px-4 py-4 text-sm text-[#c0b2a4]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Pricing</p>
              <p className="mt-2">₹{price}{compareAtPrice ? ` / ₹${compareAtPrice}` : ""}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#2f2926] bg-[#151210] px-4 py-4 text-sm text-[#c0b2a4]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Launch</p>
              <p className="mt-2">
                {status === "draft"
                  ? launchCountdown || "Draft stays private until scheduled or added to a scheduled drop."
                  : status === "hidden"
                    ? "Hidden from customers."
                    : "Visible now."}
              </p>
            </div>
          </div>

          {isEditing ? (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <select
                  value={status}
                  onChange={(event) => {
                    const nextStatus = event.target.value as ProductDetail["status"];
                    setStatus(nextStatus);
                    if (nextStatus !== "draft") setLaunchAt("");
                  }}
                  className="rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Live</option>
                  <option value="hidden">Hidden</option>
                </select>
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

              {status === "draft" ? (
                <div className="mt-4">
                  <input
                    value={launchAt}
                    onChange={(event) => setLaunchAt(event.target.value)}
                    type="datetime-local"
                    className="w-full rounded-[1.3rem] border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none [color-scheme:dark]"
                  />
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-32 rounded-[1.4rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                />
                <div className="grid gap-4">
                  <input
                    value={fabric}
                    onChange={(event) => setFabric(event.target.value)}
                    placeholder="Fabric"
                    className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                  />
                  <input
                    value={modelInfo}
                    onChange={(event) => setModelInfo(event.target.value)}
                    placeholder="Model info"
                    className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                  />
                  <input
                    value={shippingNote}
                    onChange={(event) => setShippingNote(event.target.value)}
                    placeholder="Shipping note"
                    className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {imageTiles.map((tile) => (
                  <div key={tile.id} className="overflow-hidden rounded-[1.4rem] border border-[#2f2926] bg-[#171311]">
                    <div className="relative aspect-[4/5] w-full">
                      {tile.previewUrl ? (
                        <Image
                          src={tile.previewUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 1280px) 50vw, 20vw"
                          className="object-cover"
                          unoptimized={tile.kind === "pending" || isSupabaseStorageUrl(tile.previewUrl)}
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (tile.kind === "saved") {
                            setImages((current) => current.filter((image) => image.id !== tile.image?.id));
                          } else {
                            setPendingFiles((current) => current.filter((_, index) => index !== tile.fileIndex));
                          }
                        }}
                        className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#312a26] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[#c7b9ab]">Product imagery</p>
                  <label className="cursor-pointer rounded-full border border-[#312a26] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f1ddc7]">
                    Add more
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      multiple
                      onChange={(event) => {
                        const next = Array.from(event.target.files ?? []);
                        if (!next.length) return;
                        setPendingFiles((current) => [...current, ...next]);
                        event.currentTarget.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
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
                  disabled={isSaving}
                  className="rounded-full bg-[#f1ddc7] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715] disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-[#312a26] px-5 py-3 text-sm uppercase tracking-[0.18em] text-[#c7b9ab]"
                >
                  Cancel
                </button>
                {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
              </div>
            </>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-[#2f2926] bg-[#151210] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Description</p>
                <p className="mt-3 text-sm leading-7 text-[#c7b9ab]">{product.description}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#2f2926] bg-[#151210] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Product info</p>
                <div className="mt-3 space-y-2 text-sm text-[#c7b9ab]">
                  {product.fabric ? <p>Fabric: {product.fabric}</p> : null}
                  {product.modelInfo ? <p>Model: {product.modelInfo}</p> : null}
                  {product.shippingNote ? <p>Shipping: {product.shippingNote}</p> : null}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
