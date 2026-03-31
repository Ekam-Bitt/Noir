"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DropCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: "",
    title: "",
    eyebrow: "Drop",
    intro: "",
    narrative: "",
    mood: "",
    palette: "#121212, #6b5649, #d8c3b3",
    featuredProductSlugs: "",
    isVisible: true,
    isFeatured: true,
  });
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage(null);
        const response = await fetch("/api/admin/drops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            palette: form.palette.split(",").map((item) => item.trim()) as [string, string, string],
            featuredProductSlugs: form.featuredProductSlugs
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setMessage(data.error ?? "Unable to create drop.");
          return;
        }
        setMessage("Drop created.");
        setForm({
          slug: "",
          title: "",
          eyebrow: "Drop",
          intro: "",
          narrative: "",
          mood: "",
          palette: "#121212, #6b5649, #d8c3b3",
          featuredProductSlugs: "",
          isVisible: true,
          isFeatured: true,
        });
        router.refresh();
      }}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Create drop</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          ["slug", "Slug"],
          ["title", "Title"],
          ["eyebrow", "Eyebrow"],
          ["mood", "Mood"],
          ["palette", "Palette: color1, color2, color3"],
          ["featuredProductSlugs", "Featured product slugs"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={form[key as keyof typeof form] as string}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            placeholder={label}
            className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
          />
        ))}
        <textarea
          value={form.intro}
          onChange={(event) => setForm((current) => ({ ...current, intro: event.target.value }))}
          placeholder="Intro"
          className="min-h-24 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.narrative}
          onChange={(event) => setForm((current) => ({ ...current, narrative: event.target.value }))}
          placeholder="Narrative"
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
      </div>
      <div className="mt-4 flex gap-6 text-sm text-[#c7b9ab]">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) => setForm((current) => ({ ...current, isVisible: event.target.checked }))}
          />
          Visible
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
          />
          Featured
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
        >
          Create drop
        </button>
        {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
      </div>
    </form>
  );
}
