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
    { label: "New", value: "new" },
    { label: "Best Selling", value: "best-selling" },
    { label: "Price Low", value: "price-asc" },
    { label: "Price High", value: "price-desc" },
  ],
};

export const metadata: Metadata = {
  title: "Shop All Essentials",
  description:
    "Explore the full Noir Chapter collection. Premium minimalist silhouettes, crafted essentials, and cinematic limited drops.",
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
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <section className="border border-white/8 bg-[#100d0c]">
        <div className="grid gap-px bg-white/8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[#100d0c] p-6 md:p-10">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#8c8074]">Storefront</p>
            <h1 className="mt-4 text-[3rem] leading-[0.92] tracking-[-0.08em] text-[#f5efe8] md:text-[5.75rem]">
              SHOP
              <br />
              THE DROP
            </h1>
          </div>

          <div className="flex items-end justify-between bg-[#100d0c] p-6 md:p-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#8c8074]">Selection</p>
              <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[#f5efe8]">
                {products.length} product{products.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href="/products"
              className="text-[11px] uppercase tracking-[0.24em] text-[#a99988] transition hover:text-[#f5efe8]"
            >
              Reset
            </Link>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/8 bg-white/8 lg:grid-cols-4">
          <div className="bg-[#100d0c] p-4 md:p-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8c8074]">Category</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className={`border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${!category && !subcategory && !color && !size ? "border-[#f1ddc7] text-[#f5efe8]" : "border-white/10 text-[#b4a697]"}`}
              >
                All
              </Link>
              {filterLinks.categories.map((item) => (
                <Link
                  key={item}
                  href={`/products?category=${item}`}
                  className={`border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${category === item ? "border-[#f1ddc7] text-[#f5efe8]" : "border-white/10 text-[#b4a697]"}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#100d0c] p-4 md:p-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8c8074]">Size</p>
            <div className="flex flex-wrap gap-2">
              {filterLinks.sizes.map((item) => (
                <Link
                  key={item}
                  href={`/products?size=${item}`}
                  className={`border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${size === item ? "border-[#f1ddc7] text-[#f5efe8]" : "border-white/10 text-[#b4a697]"}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#100d0c] p-4 md:p-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8c8074]">Color</p>
            <div className="flex flex-wrap gap-2">
              {filterLinks.colors.map((item) => (
                <Link
                  key={item}
                  href={`/products?color=${item}`}
                  className={`border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${color === item ? "border-[#f1ddc7] text-[#f5efe8]" : "border-white/10 text-[#b4a697]"}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#100d0c] p-4 md:p-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#8c8074]">Sort</p>
            <div className="flex flex-wrap gap-2">
              {filterLinks.sort.map((entry) => (
                <Link
                  key={entry.label}
                  href={entry.value ? `/products?sort=${entry.value}` : "/products"}
                  className={`border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${sort === entry.value || (!sort && !entry.value) ? "border-[#f1ddc7] text-[#f5efe8]" : "border-white/10 text-[#b4a697]"}`}
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="border border-dashed border-[#2b2623] px-6 py-16 text-center">
            <h3 className="text-3xl tracking-[-0.05em] text-[#f5efe8]">Nothing matched.</h3>
            <p className="mt-3 text-[#a7998b]">Try a broader filter mix.</p>
          </div>
        )}
      </section>
    </div>
  );
}
