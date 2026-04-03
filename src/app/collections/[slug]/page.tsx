import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/product/product-grid";
import { GradientPanel } from "@/components/ui/gradient-panel";
import { listProducts } from "@/lib/services/commerce";
import { getCollectionStory } from "@/lib/services/content";
import { isSupabaseStorageUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getCollectionStory(slug);

  if (!story) {
    return { title: "Collection Not Found" };
  }

  return {
    title: story.title,
    description: story.intro,
    openGraph: {
      title: `${story.title} | Noir Chapter`,
      description: story.intro,
      images: story.image ? [{ url: story.image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.intro,
      images: story.image ? [story.image] : [],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getCollectionStory(slug);

  if (!story) notFound();
  
  const featured = await listProducts({ slugs: story.featuredProductSlugs });

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-8">
        <div className="overflow-hidden border border-white/8 bg-[#100d0c]">
          <div className="grid gap-px bg-white/8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[58svh] bg-[#14110f]">
              {story.image ? (
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 65vw"
                  unoptimized={isSupabaseStorageUrl(story.image)}
                  priority
                />
              ) : (
                <GradientPanel palette={["#1a1614", "#120f0d", "#26211f"]} label={`Chapter ${story.chapterNumber}`} className="h-full min-h-[58svh]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,0.1),rgba(10,8,7,0.28)_35%,rgba(10,8,7,0.88)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#d4c1ae]">Chapter {story.chapterNumber}</p>
                <h1 className="mt-3 max-w-4xl text-5xl leading-none tracking-[-0.08em] text-[#f5efe8] md:text-7xl" data-test="hydration-fix-applied">
                  {story.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#100d0c] p-6 md:p-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#9e9082]">Collection</p>
                <p className="mt-5 max-w-xl text-lg leading-8 text-[#d3c5b7]">{story.intro}</p>
              </div>

              <div className="mt-10 grid gap-8 border-t border-white/8 pt-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#9e9082]">Mood</p>
                  <p className="mt-3 text-2xl tracking-[-0.04em] text-[#f5efe8]">{story.mood}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#9e9082]">Narrative</p>
                  <p className="mt-3 max-w-xl text-base leading-8 text-[#b8aa9d]">{story.narrative}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Catalogue</p>
            <h2 className="mt-3 text-4xl tracking-[-0.05em] text-[#f5efe8] md:text-5xl">Shop the drop</h2>
          </div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#a99988]">{featured.length} pieces</p>
        </div>
        {featured.length ? (
          <ProductGrid products={featured} />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#2f2926] px-6 py-16 text-center">
            <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">No featured products yet.</p>
            <p className="mt-3 text-[#a7988b]">Assign products to this collection from admin once inventory is live.</p>
          </div>
        )}
      </section>
    </div>
  );
}
