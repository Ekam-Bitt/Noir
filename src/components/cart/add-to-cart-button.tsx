"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { ProductDetail } from "@/lib/types";

export function AddToCartButton({
  product,
  selectedVariantId,
}: {
  product: ProductDetail;
  selectedVariantId: string | null;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variant = product.variants.find((entry) => entry.id === selectedVariantId);
  const disabled = !variant || variant.stock < 1;

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={async () => {
          if (!variant) return;
          setError(null);
          const message = await addItem({ product, variantId: variant.id });
          if (message) {
            setError(message);
            return;
          }
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1400);
        }}
        className="w-full rounded-full bg-[#f1ddc7] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#191614] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-[#3a332e] disabled:text-[#8e8378]"
      >
        {disabled ? "Sold Out" : added ? "Added To Bag" : "Add To Bag"}
      </button>
      {error ? <p className="text-sm text-[#d79f8d]">{error}</p> : null}
    </div>
  );
}
