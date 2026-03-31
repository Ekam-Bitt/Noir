"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { StoreSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage(null);
        const response = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setMessage(data.error ?? "Unable to save settings.");
          return;
        }
        setMessage("Settings saved.");
        router.refresh();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["brandName", "Brand name"],
          ["logoText", "Logo text"],
          ["brandTagline", "Brand tagline"],
          ["announcement", "Announcement"],
          ["heroTitle", "Hero title"],
          ["heroCta", "Hero CTA"],
          ["heroSecondaryCta", "Secondary CTA"],
          ["newsletterHeading", "Newsletter heading"],
          ["newsletterPlaceholder", "Newsletter placeholder"],
          ["contactEmail", "Contact email"],
          ["contactPhone", "Contact phone"],
          ["contactHours", "Contact hours"],
          ["brandCanvas", "Brand canvas color"],
          ["brandInk", "Brand ink color"],
          ["brandAccent", "Brand accent color"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={form[key as keyof StoreSettings] as string}
            onChange={(event) =>
              setForm((current) => ({ ...current, [key]: event.target.value }))
            }
            placeholder={label}
            className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
          />
        ))}
        <input
          value={String(form.freeShippingThreshold)}
          onChange={(event) =>
            setForm((current) => ({ ...current, freeShippingThreshold: Number(event.target.value) }))
          }
          placeholder="Free shipping threshold"
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <input
          value={String(form.standardShippingFee)}
          onChange={(event) =>
            setForm((current) => ({ ...current, standardShippingFee: Number(event.target.value) }))
          }
          placeholder="Standard shipping fee"
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <input
          value={String(form.expressShippingFee)}
          onChange={(event) =>
            setForm((current) => ({ ...current, expressShippingFee: Number(event.target.value) }))
          }
          placeholder="Express shipping fee"
          className="rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <textarea
          value={form.marquee.join(", ")}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              marquee: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
            }))
          }
          placeholder="Marquee items separated by commas"
          className="min-h-24 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.heroCopy}
          onChange={(event) => setForm((current) => ({ ...current, heroCopy: event.target.value }))}
          placeholder="Hero copy"
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.aboutHeadline}
          onChange={(event) => setForm((current) => ({ ...current, aboutHeadline: event.target.value }))}
          placeholder="About headline"
          className="min-h-24 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.aboutBody}
          onChange={(event) => setForm((current) => ({ ...current, aboutBody: event.target.value }))}
          placeholder="About body"
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.laboratoryBody}
          onChange={(event) =>
            setForm((current) => ({ ...current, laboratoryBody: event.target.value }))
          }
          placeholder="Laboratory body"
          className="min-h-28 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.faqTitle}
          onChange={(event) => setForm((current) => ({ ...current, faqTitle: event.target.value }))}
          placeholder="FAQ title"
          className="min-h-24 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.shippingTitle}
          onChange={(event) => setForm((current) => ({ ...current, shippingTitle: event.target.value }))}
          placeholder="Shipping title"
          className="min-h-24 rounded-[1.5rem] border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
        />
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-[#2f2926] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9e9082]">Payment methods</p>
        <div className="mt-4 space-y-4">
          {form.paymentMethods.map((method, index) => (
            <label key={method.id} className="flex items-start gap-4 rounded-[1.4rem] border border-[#2f2926] p-4">
              <input
                type="checkbox"
                checked={method.enabled}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentMethods: current.paymentMethods.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, enabled: event.target.checked } : entry,
                    ),
                  }))
                }
              />
              <span>
                <span className="block text-sm text-[#f5efe8]">{method.label}</span>
                <span className="block text-sm leading-7 text-[#9e9082]">{method.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
        >
          Save settings
        </button>
        {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
      </div>
    </form>
  );
}
