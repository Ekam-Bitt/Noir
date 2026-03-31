"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CollectionStory } from "@/lib/types";

export function DropAdminCard({ drop }: { drop: CollectionStory }) {
  const router = useRouter();
  const [form, setForm] = useState(drop);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <article className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["title", "Title"],
          ["eyebrow", "Eyebrow"],
          ["mood", "Mood"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={form[key as keyof CollectionStory] as string}
            onChange={(event) =>
              setForm((current) => ({ ...current, [key]: event.target.value }))
            }
            placeholder={label}
            className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
          />
        ))}
        <input
          value={form.palette.join(", ")}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              palette: event.target.value.split(",").map((item) => item.trim()) as [string, string, string],
            }))
          }
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <input
          value={form.featuredProductSlugs.join(", ")}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              featuredProductSlugs: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
            }))
          }
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.intro}
          onChange={(event) => setForm((current) => ({ ...current, intro: event.target.value }))}
          className="min-h-24 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.narrative}
          onChange={(event) => setForm((current) => ({ ...current, narrative: event.target.value }))}
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
      </div>
      <div className="mt-4 flex gap-6 text-sm text-[#c7b9ab]">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isVisible !== false}
            onChange={(event) => setForm((current) => ({ ...current, isVisible: event.target.checked }))}
          />
          Visible
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isFeatured !== false}
            onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
          />
          Featured
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={async () => {
            setMessage(null);
            const response = await fetch(`/api/admin/drops/${drop.slug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
              setMessage(data.error ?? "Unable to save drop.");
              return;
            }
            setMessage("Drop saved.");
            router.refresh();
          }}
          className="rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
        >
          Save drop
        </button>
        {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
      </div>
    </article>
  );
}
