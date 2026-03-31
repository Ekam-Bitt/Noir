import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { listProducts } from "@/lib/services/commerce";

const filterLinks = {
  categories: ["Men", "Women", "Unisex"],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["Noir", "Stone", "Olive", "Bone", "Mocha", "Slate"],
  sort: [
    { label: "Featured", value: "" },
    { label: "New to Old", value: "new" },
    { label: "Best Selling", value: "best-selling" },
    { label: "Price Low to High", value: "price-asc" },
    { label: "Price High to Low", value: "price-desc" },
  ],
};

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse premium tops, bottoms, accessories, and limited collections.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const subcategory = typeof params.subcategory === "string" ? params.subcategory : undefined;
  const color = typeof params.color === "string" ? params.color : undefined;
  const size = typeof params.size === "string" ? params.size : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;

  const products = await listProducts({ category, subcategory, color, size, tag, sort });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-8 rounded-[2rem] border border-[#241f1d] bg-[#120f0d] p-6 lg:sticky lg:top-28 lg:h-fit">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Filters</p>
            <h1 className="mt-4 text-3xl tracking-[-0.04em] text-[#f5efe8]">Shop the collection</h1>
          </div>
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8d7f73]">Category</p>
              <div className="flex flex-wrap gap-2">
                {filterLinks.categories.map((item) => (
                  <Link
                    key={item}
                    href={`/products?category=${item}`}
                    className={`rounded-full border px-3 py-2 text-sm ${category === item ? "border-[#f1ddc7] text-[#f5efe8]" : "border-[#322b27] text-[#b4a697]"}`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8d7f73]">Size</p>
              <div className="flex flex-wrap gap-2">
                {filterLinks.sizes.map((item) => (
                  <Link
                    key={item}
                    href={`/products?size=${item}`}
                    className={`rounded-full border px-3 py-2 text-sm ${size === item ? "border-[#f1ddc7] text-[#f5efe8]" : "border-[#322b27] text-[#b4a697]"}`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8d7f73]">Shop by color</p>
              <div className="flex flex-wrap gap-2">
                {filterLinks.colors.map((item) => (
                  <Link
                    key={item}
                    href={`/products?color=${item}`}
                    className={`rounded-full border px-3 py-2 text-sm ${color === item ? "border-[#f1ddc7] text-[#f5efe8]" : "border-[#322b27] text-[#b4a697]"}`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#241f1d] bg-[#120f0d] p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">PLP</p>
              <h2 className="mt-2 text-4xl tracking-[-0.04em] text-[#f5efe8]">Premium essentials and limited drops</h2>
              <p className="mt-3 text-sm text-[#b8aa9c]">
                Filters for size, color, category, and collection-inspired tags. Sort by newness, best-selling, or price.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterLinks.sort.map((entry) => (
                <Link
                  key={entry.label}
                  href={entry.value ? `/products?sort=${entry.value}` : "/products"}
                  className={`rounded-full border px-3 py-2 text-sm ${sort === entry.value || (!sort && !entry.value) ? "border-[#f1ddc7] text-[#f5efe8]" : "border-[#322b27] text-[#b4a697]"}`}
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#2b2623] px-6 py-16 text-center">
              <h3 className="text-3xl tracking-[-0.04em] text-[#f5efe8]">No products matched that filter.</h3>
              <p className="mt-3 text-[#a7998b]">Try a broader size, color, or sort combination.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
