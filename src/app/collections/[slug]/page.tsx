import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/product/product-grid";
import { GradientPanel } from "@/components/ui/gradient-panel";
import { listProducts } from "@/lib/services/commerce";
import { getCollectionStory } from "@/lib/services/content";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getCollectionStory(slug);

  if (!story) notFound();

  const products = await listProducts();
  const featured = products.filter((product) => story.featuredProductSlugs.includes(product.slug));

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2.4rem] border border-[#26211f] bg-[#110f0d] p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-[#9e9082]">{story.eyebrow}</p>
          <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">{story.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#c7b9ab]">{story.intro}</p>
          <p className="mt-8 max-w-2xl text-base leading-8 text-[#b6a89a]">{story.narrative}</p>
          <p className="mt-8 rounded-full border border-[#312a26] px-4 py-2 text-sm text-[#f1ddc7] inline-block">
            {story.mood}
          </p>
        </div>
        <GradientPanel palette={story.palette} label="Collection story" className="min-h-[520px]" />
      </section>




      <section className="mt-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Shop the story</p>
          <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#f5efe8]">Featured pieces from {story.title}</h2>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
