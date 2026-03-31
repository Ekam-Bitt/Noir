import { getStoreSettings } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">About the label</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">{settings.aboutHeadline}</h1>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ["Philosophy", "We design elevated essentials and limited capsules that feel cinematic without losing wearability."],
          ["Sustainability", "Small-batch drops, durable fabrics, and slower merchandising help us avoid disposable fashion rhythms."],
          ["Creative process", "Every chapter starts with mood, palette, and movement before a single silhouette is finalized."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
            <h2 className="text-2xl tracking-[-0.04em] text-[#f5efe8]">{title}</h2>
            <p className="mt-4 leading-8 text-[#c7b9ab]">{copy}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Timeline</p>
        <p className="mt-4 max-w-3xl leading-8 text-[#c7b9ab]">{settings.aboutBody}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            ["2024", "The label begins with a handful of premium jersey shapes and a focus on material weight."],
            ["2025", "Editorial storytelling expands the universe through archive capsules and collection chapters."],
            ["2026", "The storefront evolves into a complete online shopping experience."],
          ].map(([year, copy]) => (
            <div key={year}>
              <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">{year}</p>
              <p className="mt-3 leading-8 text-[#c7b9ab]">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
