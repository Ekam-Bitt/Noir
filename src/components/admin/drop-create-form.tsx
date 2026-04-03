"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProductDetail } from "@/lib/types";
import { isSupabaseStorageUrl } from "@/lib/utils";

function toIsoFromLocal(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

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

function ProductSelector({
  products,
  selected,
  onToggle,
}: {
  products: ProductDetail[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {products.map((product) => {
        const active = selected.includes(product.slug);
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onToggle(product.slug)}
            className={`flex items-center gap-4 rounded-[1.6rem] border p-3 text-left transition ${
              active
                ? "border-[#f1ddc7] bg-[#1a1512]"
                : "border-[#2f2926] bg-[#120f0d] hover:border-[#5c5147]"
            }`}
          >
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-[#181311]">
              {(product.images[0]?.url || product.images[0]?.path) ? (
                <Image
                  src={product.images[0].url || product.images[0].path || ""}
                  alt={product.images[0].alt ?? product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized={isSupabaseStorageUrl(product.images[0].url || product.images[0].path)}
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${product.accent[0]}, ${product.accent[1]})`,
                  }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-[#f5efe8]">{product.name}</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-[0.15em] text-[#807468]">
                {product.status}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const initialState = {
  slug: "",
  title: "",
  chapterNumber: "",
  intro: "",
  narrative: "",
  mood: "",
  image: "",
  launchAt: "",
  isVisible: true,
  isFeatured: true,
  isArchived: false,
};

export function DropCreateForm({ products }: { products: ProductDetail[] }) {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [selectedProductSlugs, setSelectedProductSlugs] = useState<string[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string[] | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const selectableProducts = useMemo(
    () =>
      [...products].sort((left, right) => {
        const leftSelected = selectedProductSlugs.includes(left.slug) ? 1 : 0;
        const rightSelected = selectedProductSlugs.includes(right.slug) ? 1 : 0;
        if (leftSelected !== rightSelected) return rightSelected - leftSelected;
        if (left.status !== right.status) return left.status.localeCompare(right.status);
        return left.name.localeCompare(right.name);
      }),
    [products, selectedProductSlugs],
  );

  const inputClass = "w-full rounded-full border border-[#312a26] bg-[#120f0d]/50 px-5 py-3 text-sm text-[#f5efe8] outline-none placeholder:text-[#5c544d] focus:border-[#f1ddc7]/30 transition-colors";
  const textareaClass = "w-full min-h-24 rounded-[1.5rem] border border-[#312a26] bg-[#120f0d]/50 px-5 py-3 text-sm text-[#f5efe8] outline-none placeholder:text-[#5c544d] focus:border-[#f1ddc7]/30 transition-colors";

  return (
    <form
      className="rounded-[2.5rem] border border-[#26211f] bg-[#1a1715] p-8 shadow-2xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        let uploadedBanner = undefined;

        try {
          if (bannerFile) {
            const body = new FormData();
            body.append("collectionSlug", form.slug);
            body.append("file", bannerFile);

            const uploadResponse = await fetch("/api/admin/uploads/collection-image", {
              method: "POST",
              body,
            });
            const uploadData = (await uploadResponse.json()) as { error?: string; image?: { url?: string } };
            if (!uploadResponse.ok || !uploadData.image?.url) {
              throw new Error(uploadData.error ?? "Unable to upload collection banner.");
            }
            uploadedBanner = uploadData.image.url;
          }
        } catch (error) {
          setMessage([error instanceof Error ? error.message : "Unable to upload collection banner."]);
          setSubmitting(false);
          return;
        }

        const response = await fetch("/api/admin/drops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            image: uploadedBanner,
            launchAt: toIsoFromLocal(form.launchAt),
            featuredProductSlugs: selectedProductSlugs,
          }),
        });

        const data = (await response.json()) as { error?: string | string[] };
        if (!response.ok) {
          setMessage(Array.isArray(data.error) ? data.error : [data.error ?? "Unable to create drop."]);
          setSubmitting(false);
          return;
        }

        setForm(initialState);
        setSelectedProductSlugs([]);
        setBannerFile(null);
        setMessage(["Drop created."]);
        setSubmitting(false);
        router.refresh();
      }}
    >
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Drop Builder</p>
        <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">New collection launch</h2>
        <p className="mt-2 max-w-xl text-sm text-[#ab9d90]">
          Bundle products, set the narrative, and schedule the release event.
        </p>
      </div>

      <div className="space-y-12">
        <Section title="Identity" description="Basic identifiers and launch schedule.">
          <Field label="Collection Title">
            <input
              value={form.title}
              onChange={(e) => setForm(c => ({ ...c, title: e.target.value }))}
              placeholder="e.g. Midnight Heat"
              className={inputClass}
            />
          </Field>
          <Field label="Chapter Number">
            <input
              value={form.chapterNumber}
              onChange={(e) => setForm(c => ({ ...c, chapterNumber: e.target.value }))}
              placeholder="01"
              className={inputClass}
            />
          </Field>
          <Field label="URL Slug">
            <input
              value={form.slug}
              onChange={(e) => setForm(c => ({ ...c, slug: e.target.value }))}
              placeholder="midnight-heat"
              className={inputClass}
            />
          </Field>
          <Field label="Auto-Launch Schedule">
            <input
              value={form.launchAt}
              onChange={(e) => setForm(c => ({ ...c, launchAt: e.target.value }))}
              type="datetime-local"
              className={`${inputClass} [color-scheme:dark]`}
            />
          </Field>
        </Section>

        <Section title="Copy & Mood" description="The storytelling and editorial direction.">
          <Field label="Mood / Aesthetic">
            <input
              value={form.mood}
              onChange={(e) => setForm(c => ({ ...c, mood: e.target.value }))}
              placeholder="e.g. Urban Nocturne"
              className={inputClass}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Editorial Intro">
              <textarea
                value={form.intro}
                onChange={(e) => setForm(c => ({ ...c, intro: e.target.value }))}
                placeholder="Short, punchy summary of the vibe..."
                className={textareaClass}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Full Narrative">
              <textarea
                value={form.narrative}
                onChange={(e) => setForm(c => ({ ...c, narrative: e.target.value }))}
                placeholder="The deep story behind the pieces..."
                className={textareaClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Media" description="The hero visuals for this collection story.">
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-4">
              {/* Image Preview Tile */}
              {form.image || imagePreview ? (
                <div className="group relative aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-2xl border border-[#312a26] bg-[#120f0d]">
                  <Image
                    src={imagePreview || (form.image ?? "")}
                    alt="Banner Preview"
                    fill
                    className="object-cover"
                    unoptimized={!!imagePreview || isSupabaseStorageUrl(form.image || "")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setImagePreview(null);
                      setForm(c => ({ ...c, image: "" }));
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
                  >
                    <span className="rounded-full bg-red-500/80 p-2 text-white">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                </div>
              ) : null}

              {/* Upload Action */}
              <label className="flex aspect-[4/5] w-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#312a26] bg-[#120f0d]/30 px-6 py-10 transition hover:border-[#f1ddc7]/30 hover:bg-[#120f0d]/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBannerFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                  className="hidden"
                />
                <div className="text-center text-[#8d7f73]">
                  <svg className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="mt-2 text-[10px] uppercase tracking-widest font-medium">Add</p>
                </div>
              </label>
            </div>
          </div>
        </Section>

        <Section title="Curation" description="Select the pieces included in this drop.">
          <div className="md:col-span-2 space-y-4">
             <div className="flex items-center justify-between px-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8d7f73]">Available Inventory</p>
                <div className="flex items-center gap-2 rounded-full bg-[#f1ddc7]/10 px-3 py-1 text-[#f1ddc7]">
                  <span className="text-[10px] font-bold">{selectedProductSlugs.length} SELECTED</span>
                </div>
             </div>
             <div className="max-h-[400px] overflow-y-auto rounded-[2rem] border border-[#2f2926] bg-[#120f0d]/30 p-4 scrollbar-thin scrollbar-thumb-[#312a26]">
                <ProductSelector
                  products={selectableProducts}
                  selected={selectedProductSlugs}
                  onToggle={(slug) =>
                    setSelectedProductSlugs((current) =>
                      current.includes(slug) ? current.filter((entry) => entry !== slug) : [...current, slug],
                    )
                  }
                />
             </div>
          </div>
        </Section>

        <div className="flex items-center gap-8 pt-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#c7b9ab]">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setForm(c => ({ ...c, isVisible: e.target.checked }))}
              className="h-5 w-5 rounded-md border-[#312a26] bg-[#120f0d] text-[#f1ddc7] focus:ring-0"
            />
            Visible
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#c7b9ab]">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm(c => ({ ...c, isFeatured: e.target.checked }))}
              className="h-5 w-5 rounded-md border-[#312a26] bg-[#120f0d] text-[#f1ddc7] focus:ring-0"
            />
            Featured in homepage
          </label>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-6 border-t border-[#312a26] pt-10 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          {message ? (
            <div className="rounded-[1.2rem] border border-[#f1ddc7]/20 bg-[#120f0d] px-4 py-3 text-sm text-[#f1ddc7]">
              {message.map((m, i) => <p key={i}>{m}</p>)}
            </div>
          ) : (
            <p className="text-xs text-[#8d7f73]">Archive drops to hide them from the store without deleting history.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#f1ddc7] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#1a1715] transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Building Drop..." : "Create Drop Entry"}
        </button>
      </div>
    </form>
  );
}
