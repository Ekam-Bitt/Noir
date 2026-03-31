"use client";

import { useMemo, useState } from "react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { WishlistToggleButton } from "@/components/product/wishlist-toggle-button";
import type { ProductCard, ProductDetail as ProductDetailType } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";

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
        (variant) =>
          variant.color === selectedColor && variant.size === selectedSize,
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
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9b8c80]">{product.collection}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#f5efe8] md:text-5xl">
            {product.name}
          </h1>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-2xl font-medium text-[#f5efe8]">{formatINR(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="pb-1 text-sm text-[#8d7f73] line-through">{formatINR(product.compareAtPrice)}</p>
            ) : null}
          </div>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#c4b7a9]">{product.description}</p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.18em] text-[#8d7f73]">Color</p>
                <p className="text-sm text-[#f5efe8]">{selectedColor}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      const nextSize = product.variants.find((variant) => variant.color === color)?.size;
                      if (nextSize) setSelectedSize(nextSize);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedColor === color
                        ? "border-[#f1ddc7] text-[#f5efe8]"
                        : "border-[#352f2c] text-[#9e9082]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.18em] text-[#8d7f73]">Size</p>
                <p className="text-sm text-[#9e9082]">Size guide</p>
              </div>
              <div className="flex flex-wrap gap-3">
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
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedSize === size
                          ? "border-[#f1ddc7] text-[#f5efe8]"
                          : "border-[#352f2c] text-[#9e9082]"
                      } disabled:cursor-not-allowed disabled:opacity-35`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#27221f] bg-[#151210] p-5">
              <div className="flex items-center justify-between text-sm text-[#c4b7a9]">
                <span>Availability</span>
                <span>{activeVariant?.stock ? `${activeVariant.stock} left` : "Out of stock"}</span>
              </div>
              <p className="mt-2 text-sm text-[#8d7f73]">{product.modelInfo}</p>
            </div>

            <AddToCartButton product={product} selectedVariantId={activeVariant?.id ?? null} />
            <WishlistToggleButton productId={product.id} />
          </div>

          <div className="mt-10 grid gap-4 text-sm text-[#c4b7a9]">
            <div className="rounded-[1.5rem] border border-[#27221f] p-5">
              <h2 className="text-sm uppercase tracking-[0.24em] text-[#f5efe8]">Fabric & care</h2>
              <p className="mt-3">{product.fabric}</p>
              <ul className="mt-3 space-y-1 text-[#8d7f73]">
                {product.care.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-[#27221f] p-5">
              <h2 className="text-sm uppercase tracking-[0.24em] text-[#f5efe8]">Story</h2>
              <p className="mt-3">{product.story}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#27221f] p-5">
              <h2 className="text-sm uppercase tracking-[0.24em] text-[#f5efe8]">Shipping & returns</h2>
              <p className="mt-3">{product.shippingNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#9b8c80]">You may also like</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#f5efe8]">Complete the look</h2>
          </div>
        </div>
        <ProductGrid products={recommendations} />
      </section>
    </div>
  );
}
