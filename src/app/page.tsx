import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { GradientPanel } from "@/components/ui/gradient-panel";
import { getFeaturedProducts } from "@/lib/services/commerce";
import {
  getFeaturedCollectionStories,
  getHomePageContent,
  getLookbookEntries,
  getStoreSettings,
} from "@/lib/services/content";

export default async function Home() {
  const [content, featuredProducts, stories, lookbook, settings] = await Promise.all([
    getHomePageContent(),
    getFeaturedProducts(),
    getFeaturedCollectionStories(),
    getLookbookEntries(),
    getStoreSettings(),
  ]);

  return (
    <div className="pb-20">
      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-[#9e9082]">Drop 01 / Winter Chapter</p>
              <h1 className="mt-5 max-w-4xl text-6xl leading-[0.9] tracking-[-0.05em] text-[#f5efe8] md:text-7xl xl:text-[7rem]">
                {content.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#c6b8aa]">{content.heroCopy}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="rounded-full bg-[#f1ddc7] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.24em] text-[#1b1715]"
                >
                  {content.heroCta}
                </Link>
                <Link
                  href="/collections/winter-chapter"
                  className="rounded-full border border-[#322b27] px-7 py-4 text-center text-sm font-medium uppercase tracking-[0.22em] text-[#f5efe8]"
                >
                  {content.heroSecondaryCta}
                </Link>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {content.marquee.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#302925] px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-[#c7b9ab]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[0.78fr_0.22fr]">
            <GradientPanel palette={["#151313", "#5d4d46", "#cdb8aa"]} label="Campaign film" className="min-h-[520px]" />
            <div className="grid gap-4">
              <GradientPanel palette={["#191d22", "#6e7c89", "#ece8df"]} label="Edition" className="min-h-[250px]" />
              <GradientPanel palette={["#171311", "#6f5646", "#dfcfbf"]} label="Look 02" className="min-h-[250px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Latest drop</p>
            <h2 className="mt-4 text-4xl tracking-[-0.04em] text-[#f5efe8]">New arrivals with premium weight and quiet edge.</h2>
          </div>
          <Link href="/products?sort=new" className="text-sm uppercase tracking-[0.22em] text-[#f1ddc7]">
            View all
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-3">
        {stories.map((story) => (
          <Link
            href={`/collections/${story.slug}`}
            key={story.slug}
            className="group rounded-[2rem] border border-[#26211f] bg-[#120f0e] p-5 transition hover:-translate-y-1 hover:border-[#3a3028]"
          >
            <GradientPanel palette={story.palette} label={story.eyebrow} className="aspect-[4/5]" />
            <p className="mt-5 text-xs uppercase tracking-[0.24em] text-[#9e9082]">{story.mood}</p>
            <h3 className="mt-3 text-3xl tracking-[-0.04em] text-[#f5efe8]">{story.title}</h3>
            <p className="mt-3 text-base leading-7 text-[#c5b7a7]">{story.intro}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Brand story</p>
            <h2 className="mt-4 text-5xl tracking-[-0.04em] text-[#f5efe8]">
              {settings.aboutHeadline}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#27211e] bg-[#120f0d] p-6">
              <h3 className="text-2xl tracking-[-0.03em] text-[#f5efe8]">Our approach</h3>
              <p className="mt-3 leading-8 text-[#c6b8aa]">
                {settings.aboutBody}
              </p>
            </div>
            <div className="rounded-[2rem] border border-[#27211e] bg-[#120f0d] p-6">
              <h3 className="text-2xl tracking-[-0.03em] text-[#f5efe8]">Checkout</h3>
              <p className="mt-3 leading-8 text-[#c6b8aa]">
                INR pricing, UPI, cards, and wallets — all supported at checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="rounded-[2.4rem] border border-[#26211f] bg-[#120f0d] p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">{settings.laboratoryTitle}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <h2 className="text-5xl tracking-[-0.04em] text-[#f5efe8]">
              {settings.laboratoryBody}
            </h2>
            <p className="text-base leading-8 text-[#c6b8aa]">{settings.laboratoryBody}</p>
          </div>
          <Link
            href="/laboratory"
            className="mt-8 inline-flex rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
          >
            Explore Laboratory
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Archive & lookbooks</p>
            <h2 className="mt-4 text-4xl tracking-[-0.04em] text-[#f5efe8]">Seasonal worlds and visual chapters.</h2>
          </div>
          <Link href="/archive" className="text-sm uppercase tracking-[0.22em] text-[#f1ddc7]">
            Explore archive
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {lookbook.map((entry) => (
            <div key={entry.slug} className="rounded-[2rem] border border-[#27211e] bg-[#120f0d] p-5">
              <GradientPanel palette={entry.palette} label={entry.season} className="aspect-[4/5]" />
              <h3 className="mt-5 text-3xl tracking-[-0.04em] text-[#f5efe8]">{entry.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#c6b8aa]">{entry.caption}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
