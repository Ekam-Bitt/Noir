import Image from "next/image";
import Link from "next/link";

import { GradientPanel } from "@/components/ui/gradient-panel";
import { getArchivedCollectionStories, getLookbookEntries } from "@/lib/services/content";
import { isSupabaseStorageUrl } from "@/lib/utils";

export default async function ArchivePage() {
  const [entries, archivedDrops] = await Promise.all([
    getLookbookEntries(),
    getArchivedCollectionStories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Lookbooks / Archive</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Archive</h1>
      </div>
      {archivedDrops.length ? (
        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          {archivedDrops.map((drop) => (
            <Link key={drop.slug} href={`/collections/${drop.slug}`} className="overflow-hidden rounded-[2rem] border border-[#26211f] bg-[#120f0d]">
              <div className="grid gap-px bg-white/8 md:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[340px] bg-[#171311]">
                  {drop.image ? (
                    <Image
                      src={drop.image}
                      alt={drop.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      unoptimized={isSupabaseStorageUrl(drop.image)}
                    />
                  ) : (
                    <GradientPanel palette={["#1a1614", "#120f0d", "#26211f"]} label={`Chapter ${drop.chapterNumber}`} className="h-full min-h-[340px]" />
                  )}
                </div>
                <div className="flex flex-col justify-between bg-[#120f0d] p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Chapter {drop.chapterNumber}</p>
                    <h2 className="mt-4 text-4xl tracking-[-0.05em] text-[#f5efe8]">{drop.title}</h2>
                    <p className="mt-4 leading-8 text-[#c7b9ab]">{drop.intro}</p>
                  </div>
                  <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-[#f1ddc7]">View archive drop</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : null}
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
