import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { getCollectionStories } from "@/lib/services/content";
import { isSupabaseStorageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drops & Collections",
  description:
    "Explore the Noir Chapter archive. Each drop is a cinematic exploration of form, mood, and minimalist premium fashion.",
};

export default async function CollectionsIndexPage() {
  const collections = await getCollectionStories();

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <header className="mb-14 flex flex-col gap-5 text-center md:mb-20">
        <div className="animate-reveal [animation-delay:0.1s] opacity-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#9e9082]">Noir Chapter</p>
        </div>
        <div className="animate-reveal [animation-delay:0.2s] opacity-0">
          <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8] md:text-8xl">Drops</h1>
        </div>
        <div className="animate-reveal [animation-delay:0.3s] opacity-0">
           <p className="mx-auto max-w-lg text-balance text-[13px] leading-7 text-[#ab9d90] tracking-wide">
            An archive of campaign-led collection stories. Each chapter represents a distinct mood, form, and direction.
          </p>
        </div>
      </header>

      {collections.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
          {collections.map((collection, index) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group relative flex flex-col overflow-hidden animate-reveal opacity-0"
              style={{ animationDelay: `${0.4 + index * 0.1}s` } as React.CSSProperties}
            >
              {/* Image Container - Sharp Corners */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#120f0d] md:aspect-[16/11]">
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="hover-zoom object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={isSupabaseStorageUrl(collection.image)}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#1a1614] to-[#0f0c0b]" />
                )}
                
                {/* Overlay Gradient (slightly tighter) */}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,12,11,0.92)_0%,rgba(15,12,11,0.25)_35%,transparent_100%)] opacity-90 transition-opacity group-hover:opacity-100" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                  <div className="glass shadow-xl inline-flex items-center rounded-full px-4 py-1.5 mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#f1ddc7]">Chapter {collection.chapterNumber}</p>
                  </div>
                  <h2 className="text-3xl tracking-[-0.04em] text-[#f5efe8] md:text-5xl">{collection.title}</h2>
                  <p className="mt-4 line-clamp-1 max-w-lg text-[13px] leading-relaxed text-[#c7b9ab] opacity-80 group-hover:opacity-100 transition-opacity">
                    {collection.intro}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[3rem] border border-[#26211f] bg-[#120f0d] px-6 py-24 text-center animate-reveal md:py-40">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#9e9082]">Restocking stories</p>
          <h2 className="mt-6 text-5xl tracking-[-0.06em] text-[#f5efe8] md:text-7xl">The archive is being prepared.</h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-[#b6a89a]">
            Our chapters will appear here once the next launch is ready.
          </p>
        </div>
      )}
    </div>
  );
}
