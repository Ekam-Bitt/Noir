"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CollectionStory, ProductDetail } from "@/lib/types";
import { isSupabaseStorageUrl } from "@/lib/utils";

function toLocalDateTimeValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoFromLocal(value: string) {
  return value ? new Date(value).toISOString() : undefined;
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

function Section({ title, decoration, children }: { title: string; decoration?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#26211f] pb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7f73]">{title}</h4>
        {decoration}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string | number | boolean; children?: React.ReactNode }) {
  return (
    <div>
      <p className="px-1 text-[9px] uppercase tracking-[0.15em] text-[#5c544d]">{label}</p>
      <div className="mt-1.5">
        {children ?? <p className="rounded-xl border border-[#2f2926] bg-[#120f0d]/30 px-3 py-2 text-sm text-[#f5efe8]">{String(value ?? "—")}</p>}
      </div>
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
    <div className="grid gap-2 grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const active = selected.includes(product.slug);
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onToggle(product.slug)}
            className={`flex items-center gap-3 rounded-xl border p-2 text-left transition ${
              active ? "border-[#f1ddc7] bg-[#1b1613]" : "border-[#2f2926] bg-[#120f0d]/50"
            }`}
          >
            <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded-lg bg-[#181311]">
              {(product.images[0]?.url || product.images[0]?.path) ? (
                <Image
                  src={product.images[0].url || product.images[0].path || ""}
                  alt={product.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized={isSupabaseStorageUrl(product.images[0].url || product.images[0].path)}
                />
              ) : null}
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

export function DropAdminCard({
  drop,
  products,
}: {
  drop: CollectionStory;
  products: ProductDetail[];
}) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ...drop,
    launchAt: toLocalDateTimeValue(drop.launchAt),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const selectedProductSlugs = useMemo(() => form.featuredProductSlugs, [form.featuredProductSlugs]);
  const selectableProducts = useMemo(
    () =>
      [...products].sort((left, right) => {
        const leftSelected = selectedProductSlugs.includes(left.slug) ? 1 : 0;
        const rightSelected = selectedProductSlugs.includes(right.slug) ? 1 : 0;
        if (leftSelected !== rightSelected) return rightSelected - leftSelected;
        return left.name.localeCompare(right.name);
      }),
    [products, selectedProductSlugs],
  );

  const hasLaunchSchedule = Boolean(form.launchAt) && !form.isArchived;
  useEffect(() => {
    if (!hasLaunchSchedule) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [hasLaunchSchedule]);

  const launchCountdown = useMemo(() => {
    if (!hasLaunchSchedule) return "";
    const target = new Date(form.launchAt).getTime();
    if (Number.isNaN(target)) return "";
    const delta = target - now;
    if (delta <= 0) return "Active";
    const totalSeconds = Math.floor(delta / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `Auto-launch: ${[days ? `${days}d` : null, `${hours}h`, `${minutes}m`, `${seconds}s`].filter(Boolean).join(" ")}`;
  }, [form.launchAt, hasLaunchSchedule, now]);

  async function save() {
    setSaving(true);
    setMessage(null);
    let bannerUrl = form.image;
    try {
      if (bannerFile) {
        const body = new FormData();
        body.append("collectionSlug", drop.slug);
        body.append("file", bannerFile);
        const response = await fetch("/api/admin/uploads/collection-image", { method: "POST", body });
        const data = (await response.json()) as { error?: string; image?: { url?: string } };
        if (!response.ok || !data.image?.url) throw new Error(data.error ?? "Upload failed.");
        bannerUrl = data.image.url;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
      setSaving(false);
      return;
    }

    const response = await fetch(`/api/admin/drops/${drop.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image: bannerUrl, launchAt: toIsoFromLocal(form.launchAt) }),
    });
    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    setMessage("Saved.");
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Are you sure you want to permanently delete this drop?")) return;
    setDeleting(true);
    const response = await fetch(`/api/admin/drops/${drop.slug}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Delete failed.");
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  const inputClass = "w-full rounded-xl border border-[#312a26] bg-[#120f0d]/50 px-4 py-2 text-sm text-[#f5efe8] outline-none focus:border-[#f1ddc7]/30 transition-colors placeholder:text-[#5c544d]";
  const textareaClass = "w-full min-h-24 rounded-xl border border-[#312a26] bg-[#120f0d]/50 px-4 py-2 text-sm text-[#f5efe8] outline-none focus:border-[#f1ddc7]/30 transition-colors placeholder:text-[#5c544d]";

  return (
    <article className="group rounded-[2rem] border border-[#26211f] bg-[#120f0d] transition-all hover:border-[#312a26]">
      <div className="flex items-start gap-4 p-5">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          className="flex min-w-0 flex-1 items-center gap-5 text-left"
        >
          <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-[#181311]">
            {drop.image ? (
              <Image src={drop.image} alt={drop.title} fill sizes="60px" className="object-cover" unoptimized={isSupabaseStorageUrl(drop.image)} />
            ) : <div className="h-full w-full bg-[#1a1614]" />}
          </div>
          <div className="min-w-0 flex-1">
             <div className="flex items-center gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8d7f73]">Chapter {drop.chapterNumber}</p>
                <div className="flex items-center gap-2">
                   {form.isArchived ? (
                     <span className="rounded-full border border-[#4a2d2a] bg-[#4a2d2a]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-[#e4b3a8]">Archived</span>
                   ) : (
                     <span className="rounded-full border border-[#f1ddc7]/20 bg-[#f1ddc7]/5 px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-[#f1ddc7]">Live</span>
                   )}
                   {launchCountdown && !form.isArchived && (
                     <span className="text-[9px] text-[#8d7f73]">{launchCountdown}</span>
                   )}
                </div>
             </div>
             <h3 className="mt-1 truncate text-2xl tracking-[-0.03em] text-[#f5efe8]">{drop.title}</h3>
             <p className="mt-1 text-[11px] text-[#5c544d]">{drop.slug} • {drop.featuredProductSlugs.length} Products</p>
          </div>
          <div className="pt-2 text-[#5c544d]">
             <ChevronIcon open={isOpen} />
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2 pt-1 transition-opacity group-hover:opacity-100 md:opacity-0">
           <button
             type="button"
             onClick={() => { setOpen(true); setEditing(!isEditing); }}
             className="rounded-full border border-[#312a26] p-2.5 text-[#8d7f73] transition hover:border-[#f1ddc7]/30 hover:text-[#f1ddc7]"
           >
             <PencilIcon />
           </button>
           <button
             type="button"
             onClick={remove}
             disabled={isDeleting}
             className="rounded-full border border-[#312a26] p-2.5 text-[#5c544d] transition hover:border-[#4a2d2a] hover:text-[#e4b3a8] disabled:opacity-50"
           >
             <TrashIcon />
           </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[#26211f] p-8">
           {isEditing ? (
             <div className="space-y-10">
                <Section title="Identity">
                   <Field label="Title">
                      <input value={form.title} onChange={e => setForm(c => ({ ...c, title: e.target.value }))} className={inputClass} />
                   </Field>
                   <Field label="Chapter">
                      <input value={form.chapterNumber} onChange={e => setForm(c => ({ ...c, chapterNumber: e.target.value }))} className={inputClass} />
                   </Field>
                   <Field label="Mood">
                      <input value={form.mood} onChange={e => setForm(c => ({ ...c, mood: e.target.value }))} className={inputClass} />
                   </Field>
                   <Field label="Auto-Launch">
                      <input type="datetime-local" value={form.launchAt} onChange={e => setForm(c => ({ ...c, launchAt: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
                   </Field>
                </Section>

                <Section title="Content">
                   <div className="md:col-span-2">
                     <Field label="Editorial Intro">
                        <textarea value={form.intro} onChange={e => setForm(c => ({ ...c, intro: e.target.value }))} className={textareaClass} />
                     </Field>
                   </div>
                   <div className="md:col-span-2">
                     <Field label="Narrative">
                        <textarea value={form.narrative} onChange={e => setForm(c => ({ ...c, narrative: e.target.value }))} className={textareaClass} />
                     </Field>
                   </div>
                </Section>

                <Section title="Media">
                   <div className="md:col-span-2">
                      <div className="flex flex-wrap gap-4">
                         {(form.image || imagePreview) && (
                           <div className="group relative aspect-[4/5] w-24 overflow-hidden rounded-xl border border-[#312a26] bg-[#120f0d]">
                              <Image
                                src={imagePreview || (form.image ?? "")}
                                alt="Banner"
                                fill
                                className="object-cover"
                                unoptimized={!!imagePreview || isSupabaseStorageUrl(form.image || "")}
                              />
                              <button type="button" onClick={() => { setBannerFile(null); setImagePreview(null); setForm(c => ({ ...c, image: "" })); }} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                <span className="rounded-full bg-red-500/80 p-1 text-white"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span>
                              </button>
                           </div>
                         )}
                         <label className="flex aspect-[4/5] w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#312a26] bg-[#120f0d]/50 transition hover:border-[#f1ddc7]/30">
                            <input type="file" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setBannerFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }} className="hidden" />
                            <div className="text-center text-[#8d7f73]">
                               <svg className="mx-auto h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                               <p className="mt-1 text-[9px] uppercase tracking-widest font-medium">Add</p>
                            </div>
                         </label>
                      </div>
                   </div>
                </Section>

                <Section title="Curation" decoration={<span className="text-[9px] font-bold text-[#f1ddc7]">{form.featuredProductSlugs.length} SELECTED</span>}>
                   <div className="md:col-span-2 max-h-64 overflow-y-auto rounded-xl border border-[#2f2926] bg-[#120f0d]/30 p-3 scrollbar-thin">
                      <ProductSelector
                        products={selectableProducts}
                        selected={form.featuredProductSlugs}
                        onToggle={slug => setForm(c => ({
                           ...c,
                           featuredProductSlugs: c.featuredProductSlugs.includes(slug)
                             ? c.featuredProductSlugs.filter(s => s !== slug)
                             : [...c.featuredProductSlugs, slug]
                        }))}
                      />
                   </div>
                </Section>

                <div className="flex flex-wrap gap-6 pt-2">
                   <label className="flex items-center gap-2.5 text-xs text-[#8d7f73] cursor-pointer">
                      <input type="checkbox" checked={form.isVisible} onChange={e => setForm(c => ({ ...c, isVisible: e.target.checked }))} className="h-4 w-4 bg-[#120f0d]" />
                      Visible
                   </label>
                   <label className="flex items-center gap-2.5 text-xs text-[#8d7f73] cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(c => ({ ...c, isFeatured: e.target.checked }))} className="h-4 w-4 bg-[#120f0d]" />
                      Featured
                   </label>
                   <label className="flex items-center gap-2.5 text-xs text-[#8d7f73] cursor-pointer">
                      <input type="checkbox" checked={form.isArchived} onChange={e => setForm(c => ({ ...c, isArchived: e.target.checked }))} className="h-4 w-4 bg-[#120f0d]" />
                      Archive Drop
                   </label>
                </div>

                <div className="flex items-center gap-3 border-t border-[#26211f] pt-8">
                   <button onClick={save} disabled={isSaving} className="rounded-full bg-[#f1ddc7] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1715] transition-transform active:scale-95 disabled:opacity-50">
                      {isSaving ? "Saving..." : "Save Changes"}
                   </button>
                   <button onClick={() => setEditing(false)} className="rounded-full border border-[#312a26] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7f73] transition hover:border-[#5c544d]">
                      Cancel
                   </button>
                   {message && <span className="text-xs text-[#f1ddc7]">{message}</span>}
                </div>
             </div>
           ) : (
             <div className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                   <div className="space-y-6">
                      <Section title="Mood & Direction">
                         <Field label="Aesthetic" value={drop.mood} />
                         <Field label="Chapter" value={drop.chapterNumber} />
                      </Section>
                      <div className="space-y-4">
                         <h4 className="border-b border-[#26211f] pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7f73]">Narrative</h4>
                         <p className="text-sm leading-relaxed text-[#c7b9ab]">{drop.intro}</p>
                         <p className="text-xs leading-relaxed text-[#8d7f73]">{drop.narrative}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#26211f] bg-[#181311]">
                         {drop.image ? (
                           <Image src={drop.image} alt={drop.title} fill className="object-cover" unoptimized={isSupabaseStorageUrl(drop.image)} />
                         ) : <div className="h-full w-full bg-[#1a1614]" />}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         <p className="absolute bottom-4 left-5 text-sm font-bold text-white">Campaign Hero</p>
                      </div>

                      <Section title="Drop Curation" decoration={<span className="text-[9px] font-bold text-[#8d7f73]">{drop.featuredProductSlugs.length} PIECES</span>}>
                         <div className="md:col-span-2 grid gap-2 sm:grid-cols-2">
                            {products.filter(p => drop.featuredProductSlugs.includes(p.slug)).slice(0, 4).map(product => (
                               <div key={product.id} className="flex items-center gap-2 rounded-lg bg-[#120f0d]/30 p-2">
                                  <div className="relative h-8 w-7 overflow-hidden rounded bg-[#181311]">
                                     {product.images[0]?.url && <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="32px" unoptimized={isSupabaseStorageUrl(product.images[0]?.url)} />}
                                  </div>
                                  <p className="truncate text-[10px] text-[#f5efe8]">{product.name}</p>
                               </div>
                            ))}
                            {drop.featuredProductSlugs.length > 4 && (
                              <p className="flex items-center justify-center rounded-lg border border-dashed border-[#312a26] p-2 text-[9px] text-[#5c544d]">+{drop.featuredProductSlugs.length - 4} more</p>
                            )}
                         </div>
                      </Section>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </article>
  );
}
