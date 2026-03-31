import { GradientPanel } from "@/components/ui/gradient-panel";
import { getLookbookEntries } from "@/lib/services/content";

export default async function ArchivePage() {
  const entries = await getLookbookEntries();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Lookbooks / Archive</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Archive</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.slug} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-5">
            <GradientPanel palette={entry.palette} label={entry.season} className="aspect-[4/5]" />
            <h2 className="mt-5 text-3xl tracking-[-0.04em] text-[#f5efe8]">{entry.title}</h2>
            <p className="mt-3 leading-8 text-[#c7b9ab]">{entry.caption}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
