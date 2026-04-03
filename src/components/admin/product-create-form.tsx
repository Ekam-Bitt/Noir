"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { ProductImage } from "@/lib/types";

const initialState = {
  name: "",
  slug: "",
  category: "",
  subcategory: "",
  status: "draft",
  launchAt: "",
  price: "",
  compareAtPrice: "",
  description: "",
  fit: "",
  fabric: "",
  modelInfo: "",
  shippingNote: "",
  colors: "",
  sizes: "",
  tags: "",
  initialStock: "",
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#f5efe8]">{title}</h3>
        {description && <p className="mt-1 text-xs text-[#8d7f73]">{description}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-2 block px-2 text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">{label}</label>
      {children}
    </div>
  );
}

export function ProductCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string[] | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const showScheduleField = form.status === "draft";
  const schedulePreview = useMemo(() => {
    if (!form.launchAt) return "";
    const date = new Date(form.launchAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [form.launchAt]);
  const filePreviews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [filePreviews]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const inputClass = "w-full rounded-full border border-[#312a26] bg-[#120f0d]/50 px-5 py-4 text-sm text-[#f5efe8] outline-none placeholder:text-[#5c544d] focus:border-[#f1ddc7]/30 transition-colors";
  const textareaClass = "w-full min-h-32 rounded-[1.5rem] border border-[#312a26] bg-[#120f0d]/50 px-5 py-4 text-sm text-[#f5efe8] outline-none placeholder:text-[#5c544d] focus:border-[#f1ddc7]/30 transition-colors";
  const selectClass = "w-full appearance-none rounded-full border border-[#312a26] bg-[#120f0d]/50 px-5 py-4 text-sm text-[#f5efe8] outline-none transition-colors focus:border-[#f1ddc7]/30";

  return (
    <form
      className="rounded-[2.5rem] border border-[#26211f] bg-[#1a1715] p-8 shadow-2xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        let uploadedImages: ProductImage[] = [];

        try {
          if (files.length > 0) {
            uploadedImages = await Promise.all(
              files.map(async (file, index) => {
                const body = new FormData();
                body.append("productSlug", form.slug);
                body.append("label", index === 0 ? "Campaign" : index === 1 ? "Studio" : `Detail ${index - 1}`);
                body.append("file", file);

                const uploadResponse = await fetch("/api/admin/uploads/product-image", {
                  method: "POST",
                  body,
                });

                const uploadData = (await uploadResponse.json()) as { error?: string; image?: ProductImage };
                if (!uploadResponse.ok || !uploadData.image) {
                  throw new Error(uploadData.error ?? `Unable to upload ${file.name}.`);
                }

                return uploadData.image;
              }),
            );
          }
        } catch (error) {
          setMessage([error instanceof Error ? error.message : "Unable to upload images."]);
          setSubmitting(false);
          return;
        }

        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            story: "",
            launchAt: showScheduleField && form.launchAt ? new Date(form.launchAt).toISOString() : undefined,
            price: Number(form.price),
            compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
            colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
            sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
            tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
            initialStock: Number(form.initialStock),
            images: uploadedImages,
          }),
        });

        const data = (await response.json()) as { error?: string | string[] };
        if (!response.ok) {
          setMessage(
            Array.isArray(data.error)
              ? data.error
              : [data.error ?? "Unable to create product."],
          );
          setSubmitting(false);
          return;
        }

        setForm(initialState);
        setFiles([]);
        setMessage(["Product created."]);
        setSubmitting(false);
        router.refresh();
      }}
    >
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Create product</p>
        <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">New inventory piece</h2>
        <p className="mt-2 max-w-xl text-sm text-[#ab9d90]">
          Create standalone inventory first. Collection branding and group launches happen later from the drop builder.
        </p>
      </div>

      <div className="space-y-16">
        <Section title="Identity" description="Define how the product is identified across the platform.">
          <Field label="Product Name">
            <input
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="e.g. Midnight Silk Blouse"
              className={inputClass}
            />
          </Field>
          <Field label="URL Slug">
            <input
              value={form.slug}
              onChange={(e) => updateForm("slug", e.target.value)}
              placeholder="midnight-silk-blouse"
              className={inputClass}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Brief Description">
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Entice your customers with a compelling summary..."
                className={textareaClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Economics" description="Manage pricing strategies and initial inventory levels.">
          <Field label="Price">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm text-[#5c544d]">₹</span>
              <input
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                placeholder="2990"
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>
          <Field label="Compare-at Price">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm text-[#5c544d]">₹</span>
              <input
                value={form.compareAtPrice}
                onChange={(e) => updateForm("compareAtPrice", e.target.value)}
                placeholder="Optional"
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>
          <Field label="Initial Stock" className="md:col-span-2">
            <input
              value={form.initialStock}
              onChange={(e) => updateForm("initialStock", e.target.value)}
              placeholder="Total quantity across all variants"
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="Attributes" description="Technical details and categorization for filtering.">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>Select Category</option>
              <option>Men</option>
              <option>Women</option>
              <option>Unisex</option>
            </select>
          </Field>
          <Field label="Subcategory">
            <select
              value={form.subcategory}
              onChange={(e) => updateForm("subcategory", e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>Select Subcategory</option>
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Accessories</option>
            </select>
          </Field>
          <Field label="Fit Profile">
            <select
              value={form.fit}
              onChange={(e) => updateForm("fit", e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>Select Fit</option>
              <option>Oversized</option>
              <option>Regular</option>
              <option>Relaxed</option>
            </select>
          </Field>
          <Field label="Fabric Composition">
            <input
              value={form.fabric}
              onChange={(e) => updateForm("fabric", e.target.value)}
              placeholder="e.g. 100% Organic Cotton"
              className={inputClass}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Model Info">
              <input
                value={form.modelInfo}
                onChange={(e) => updateForm("modelInfo", e.target.value)}
                placeholder={`Optional`}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Available Colors">
            <input
              value={form.colors}
              onChange={(e) => updateForm("colors", e.target.value)}
              placeholder="Midnight, Charcoal, Bone"
              className={inputClass}
            />
          </Field>
          <Field label="Sizes">
            <input
              value={form.sizes}
              onChange={(e) => updateForm("sizes", e.target.value)}
              placeholder="XS, S, M, L, XL"
              className={inputClass}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Search Tags">
              <input
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                placeholder="New Arrival, Sustainable, Limited"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Logistics" description="Set shipping notes and schedule the public release.">
          <div className="md:col-span-2">
            <Field label="Shipping Note">
              <input
                value={form.shippingNote}
                onChange={(e) => updateForm("shippingNote", e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Publish Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  status: e.target.value,
                  launchAt: e.target.value === "draft" ? current.launchAt : "",
                }))
              }
              className={selectClass}
            >
              <option value="draft">Draft - Private stage</option>
              <option value="active">Active - Live now</option>
              <option value="hidden">Hidden - Archival only</option>
            </select>
          </Field>
          <div>
            <label className="mb-2 block px-2 text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Release Logic</label>
            <div className="rounded-[1.5rem] border border-[#312a26] bg-[#120f0d]/50 px-5 py-4 text-sm text-[#b7a99b]">
              {form.status === "draft"
                ? schedulePreview
                  ? `Scheduled to go live automatically on ${schedulePreview}.`
                  : "Draft stays private until you add a launch schedule or include it in a scheduled collection drop."
                : form.status === "active"
                  ? "This piece will be visible immediately after saving."
                  : "This piece will stay hidden until you switch it back to Draft or Active."}
            </div>
          </div>
          {showScheduleField ? (
            <div className="md:col-span-2">
              <Field label="Launch Schedule">
                <input
                  value={form.launchAt}
                  onChange={(e) => updateForm("launchAt", e.target.value)}
                  type="datetime-local"
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </Field>
            </div>
          ) : null}
        </Section>

        <Section title="Media Gallery" description="Visual assets define the collection. High resolution recommended.">
          <div className="md:col-span-2">
            <div className="rounded-[2rem] border border-[#312a26] bg-[#120f0d]/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#f5efe8]">Upload imagery</p>
                  <p className="mt-1 text-xs text-[#8d7f73]">Campaign, studio, and detail shots. Reorder by reselecting before commit if needed.</p>
                </div>
                <label className="cursor-pointer rounded-full border border-[#312a26] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f1ddc7] transition hover:border-[#f1ddc7]/40">
                  Add files
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    multiple
                    onChange={(event) => {
                      const nextFiles = Array.from(event.target.files ?? []);
                      if (!nextFiles.length) return;
                      setFiles((current) => [...current, ...nextFiles]);
                      event.currentTarget.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {filePreviews.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filePreviews.map((preview, index) => (
                    <div key={`${preview.file.name}-${preview.file.lastModified}-${index}`} className="overflow-hidden rounded-[1.4rem] border border-[#2f2926] bg-[#171311]">
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={preview.url}
                          alt={preview.file.name}
                          fill
                          sizes="(max-width: 1280px) 50vw, 20vw"
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
                          }
                          className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-[#c7b9ab]">
                        <span className="truncate">{preview.file.name}</span>
                        <span>{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <label className="mt-5 block cursor-pointer rounded-[1.6rem] border-2 border-dashed border-[#312a26] px-8 py-12 text-center transition hover:border-[#f1ddc7]/30 hover:bg-[#120f0d]/40">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1ddc7]/10 text-[#f1ddc7]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#f5efe8]">Click to choose product images</p>
                      <p className="mt-1 text-xs text-[#8d7f73]">You’ll be able to preview, remove, and add more before commit.</p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-16 flex flex-col gap-6 border-t border-[#312a26] pt-10 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          {message ? (
            <div className="rounded-[1.4rem] border border-[#3a2d29] bg-[#120f0d] px-4 py-3">
              <ul className="space-y-1 text-sm text-[#f1ddc7]">
                {message.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-[#8d7f73]">Drafts can be scheduled here or grouped into a collection drop later.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full bg-[#f1ddc7] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#1a1715] transition-all hover:bg-[#f5efe8] disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : (
            <>
              Commit Piece
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
