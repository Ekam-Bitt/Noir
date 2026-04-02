"use client";

import { useMemo, useState } from "react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGallery } from "@/components/product/product-gallery";
import { WishlistToggleButton } from "@/components/product/wishlist-toggle-button";
import type { ProductCard, ProductDetail as ProductDetailType } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function ProductDetail({
  product,
  recommendations,
}: {
  product: ProductDetailType;
  recommendations: ProductCard[];
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");

  const activeVariant = useMemo(
    () =>
      product.variants.find(
        (variant) => variant.color === selectedColor && variant.size === selectedSize,
      ) ?? product.variants[0],
    [product.variants, selectedColor, selectedSize],
  );

  const availableSizes = useMemo(
    () =>
      product.sizes.filter((size) =>
        product.variants.some((variant) => variant.size === size && variant.color === selectedColor),
      ),
    [product.sizes, product.variants, selectedColor],
  );

  return (
    <div className="space-y-24">
      <section className="grid gap-8 lg:grid-cols-[1.22fr_0.78fr]">
        <ProductGallery images={product.images} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-white/8 bg-[#100d0c]">
            <div className="border-b border-white/8 px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#8d7f73]">
                <span>{product.collection}</span>
                <span className="text-white/20">/</span>
                <span>{product.category}</span>
              </div>
              <h1 className="mt-4 text-4xl leading-[0.92] tracking-[-0.07em] text-[#f5efe8] md:text-6xl">
                {product.name}
              </h1>
              <div className="mt-5 flex items-end gap-3">
                <p className="text-xl font-medium uppercase tracking-[0.14em] text-[#f5efe8]">{formatINR(product.price)}</p>
                {product.compareAtPrice ? (
                  <p className="pb-0.5 text-sm text-[#8d7f73] line-through">{formatINR(product.compareAtPrice)}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-6 px-5 py-5 md:px-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#8d7f73]">Color</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#f5efe8]">{selectedColor}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        const nextSize = product.variants.find((variant) => variant.color === color)?.size;
                        if (nextSize) setSelectedSize(nextSize);
                      }}
                      className={`border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                        selectedColor === color
                          ? "border-[#f1ddc7] bg-[#161210] text-[#f5efe8]"
                          : "border-white/10 text-[#9e9082]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#8d7f73]">Size</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9e9082]">Guide</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const variant = product.variants.find(
                      (entry) => entry.color === selectedColor && entry.size === size,
                    );
                    const isUnavailable = !variant || variant.stock < 1;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => setSelectedSize(size)}
                        className={`border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                          selectedSize === size
                            ? "border-[#f1ddc7] bg-[#161210] text-[#f5efe8]"
                            : "border-white/10 text-[#9e9082]"
                        } disabled:cursor-not-allowed disabled:opacity-35`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-y border-white/8 py-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#c4b7a9]">
                  <span>Availability</span>
                  <span>{activeVariant?.stock ? `${activeVariant.stock} left` : "Out of stock"}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#8d7f73]">{product.modelInfo}</p>
              </div>

              <div className="space-y-3">
                <AddToCartButton product={product} selectedVariantId={activeVariant?.id ?? null} />
                <WishlistToggleButton productId={product.id} />
              </div>
            </div>
          </div>

          <div className="mt-5 border border-white/8 bg-[#100d0c]">
            <div className="border-b border-white/8 px-5 py-4 md:px-6">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8d7f73]">Details</p>
            </div>
            <div className="grid gap-0">
              <div className="border-b border-white/8 px-5 py-4 md:px-6">
                <h2 className="text-[10px] uppercase tracking-[0.32em] text-[#f5efe8]">Fabric & care</h2>
                <p className="mt-3 text-sm leading-7 text-[#c4b7a9]">{product.fabric}</p>
                <ul className="mt-3 space-y-1 text-sm leading-7 text-[#8d7f73]">
                  {product.care.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="border-b border-white/8 px-5 py-4 md:px-6">
                <h2 className="text-[10px] uppercase tracking-[0.32em] text-[#f5efe8]">Description</h2>
                <p className="mt-3 text-sm leading-7 text-[#c4b7a9]">{product.description}</p>
              </div>
              <div className="px-5 py-4 md:px-6">
                <h2 className="text-[10px] uppercase tracking-[0.32em] text-[#f5efe8]">Shipping</h2>
                <p className="mt-3 text-sm leading-7 text-[#c4b7a9]">{product.shippingNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between gap-6 border-b border-white/8 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#9b8c80]">Recommendations</p>
            <h2 className="mt-3 text-3xl tracking-[-0.05em] text-[#f5efe8]">You may also like</h2>
          </div>
        </div>
        <ProductGrid products={recommendations} />
      </section>
    </div>
  );
}
