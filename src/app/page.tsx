import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { getFeaturedProducts, listProducts } from "@/lib/services/commerce";
import { getFeaturedCollectionStories } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, newArrivals, stories] = await Promise.all([
    getFeaturedProducts(),
    listProducts({ sort: "new" }),
    getFeaturedCollectionStories(),
  ]);

  const leadProducts = (newArrivals.length ? newArrivals : featuredProducts).slice(0, 3);
  const heroLead = leadProducts[0];
  const sideProducts = leadProducts.slice(1, 3);
  const featuredStory = stories[0];

  return (
    <div className="pb-20">
      <section className="mx-auto max-w-7xl px-4 pt-4 md:px-8 md:pt-6">
        <div className="border border-white/8 bg-[#100d0c]">
          <div className="grid gap-px bg-white/8">
            <div className="bg-[#100d0c] p-5 md:p-8">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.32em] text-[#a49585]">
                <span>Drop 04</span>
                <span className="text-white/25">/</span>
                <span>{featuredStory?.title ?? "New Season"}</span>
              </div>

              <div className="mt-6">
                <p className="max-w-5xl text-[3.25rem] leading-[0.9] tracking-[-0.08em] text-[#f5efe8] md:text-[6.9rem]">
                  NOIR
                  <br />
                  CHAPTER
                </p>
                <p className="mt-5 max-w-xl text-sm uppercase tracking-[0.24em] text-[#cbbcae] md:text-[13px]">
                  Minimalist premium. Sharp silhouettes. Loud identity.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="rounded-full bg-[#f1ddc7] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#171311] transition hover:bg-[#f7e8d8]"
                >
                  Shop Now
                </Link>
                {featuredStory ? (
                  <Link
                    href={`/collections/${featuredStory.slug}`}
                    className="rounded-full border border-white/15 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-[#f5efe8] transition hover:border-[#f1ddc7]"
                  >
                    View Collection
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-white/8 lg:grid-cols-[1.25fr_0.75fr]">
            {heroLead ? (
              <Link href={`/products/${heroLead.slug}`} className="group relative min-h-[52svh] overflow-hidden bg-[#15110f]">
                {heroLead.primaryImage?.url ? (
                  <Image
                    src={heroLead.primaryImage.url}
                    alt={heroLead.primaryImage.alt ?? heroLead.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition duration-700 group-hover:scale-[1.02]"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 20%, ${heroLead.accent[2]}, transparent 28%), linear-gradient(135deg, ${heroLead.accent[0]}, ${heroLead.accent[1]})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,0.08),rgba(10,8,7,0.2)_35%,rgba(10,8,7,0.82)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[#d4c1ae]">{heroLead.collection}</p>
                      <p className="mt-3 text-2xl tracking-[-0.04em] text-[#f5efe8] md:text-4xl">{heroLead.name}</p>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#f5efe8]">View</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative min-h-[52svh] overflow-hidden bg-[#15110f]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 20%, #d8c3b3, transparent 28%), linear-gradient(135deg, #161313, #6b5649)",
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,0.08),rgba(10,8,7,0.2)_35%,rgba(10,8,7,0.82)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#d4c1ae]">Inventory</p>
                  <p className="mt-3 text-2xl tracking-[-0.04em] text-[#f5efe8] md:text-4xl">Fresh inventory starts here.</p>
                  <p className="mt-4 max-w-lg text-sm uppercase tracking-[0.22em] text-[#d8cabd]">
                    Add products, variants, and campaign imagery from admin after deployment.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-px bg-white/8">
              {sideProducts.length ? sideProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group relative min-h-[26svh] overflow-hidden bg-[#15110f]">
                  {product.primaryImage?.url ? (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.alt ?? product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,0.12),rgba(10,8,7,0.72))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#d4c1ae]">{product.collection}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="text-lg text-[#f5efe8]">{product.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#f5efe8]">Shop</p>
                    </div>
                  </div>
                </Link>
              )) : (
                <>
                  <div className="flex min-h-[26svh] items-end bg-[#15110f] p-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d7f73]">Admin ready</p>
                      <p className="mt-2 text-lg text-[#f5efe8]">Upload campaign media</p>
                    </div>
                  </div>
                  <div className="flex min-h-[26svh] items-end bg-[#15110f] p-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d7f73]">Inventory ready</p>
                      <p className="mt-2 text-lg text-[#f5efe8]">Create the first drop</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <h2 className="text-2xl tracking-[-0.05em] text-[#f5efe8] md:text-3xl">Latest</h2>
          <Link href="/products?sort=new" className="text-[11px] uppercase tracking-[0.24em] text-[#a99988] transition hover:text-[#f5efe8]">
            View all
          </Link>
        </div>
        <div className="mt-6">
          {leadProducts.length ? (
            <ProductGrid products={leadProducts} />
          ) : (
            <div className="border border-dashed border-[#2b2623] px-6 py-16 text-center">
              <p className="text-2xl tracking-[-0.04em] text-[#f5efe8]">No products yet.</p>
              <p className="mt-3 text-[#a99988]">Use admin inventory after deployment to publish the first collection.</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 md:px-8">
        <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between bg-[#100d0c] p-6 md:p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8f8276]">Signature</p>
              <p className="mt-4 text-4xl leading-none tracking-[-0.07em] text-[#f5efe8] md:text-6xl">
                LESS
                <br />
                TALK.
              </p>
              <p className="mt-2 text-4xl leading-none tracking-[-0.07em] text-[#9d8d7d] md:text-6xl">
                MORE FORM.
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                href="/products"
                className="rounded-full border border-white/12 px-5 py-3 text-[12px] uppercase tracking-[0.22em] text-[#f5efe8] transition hover:border-[#f1ddc7]"
              >
                Shop All
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-white/8 sm:grid-cols-2">
            {featuredProducts.slice(0, 2).length ? featuredProducts.slice(0, 2).map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group relative min-h-[34svh] overflow-hidden bg-[#14100f]">
                {product.primaryImage?.url ? (
                  <Image
                    src={product.primaryImage.url}
                    alt={product.primaryImage.alt ?? product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(10,8,7,0.74))]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#d4c1ae]">{product.category}</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <p className="text-xl text-[#f5efe8]">{product.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#f5efe8]">View</p>
                  </div>
                </div>
              </Link>
            )) : (
              <>
                <div className="flex min-h-[34svh] items-end bg-[#14100f] p-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d7f73]">Store setup</p>
                    <p className="mt-2 text-xl text-[#f5efe8]">Publish the first product set</p>
                  </div>
                </div>
                <div className="flex min-h-[34svh] items-end bg-[#14100f] p-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d7f73]">Media flow</p>
                    <p className="mt-2 text-xl text-[#f5efe8]">Upload product imagery from admin</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
