import Link from "next/link";

import type { ProductCard as ProductCardType } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { GradientPanel } from "@/components/ui/gradient-panel";

export function ProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-4"
    >
      <div className="relative overflow-hidden">
        <GradientPanel
          palette={product.accent}
          label={product.collection}
          className="aspect-[4/5] transition duration-500 group-hover:scale-[1.02]"
        />
        {product.soldOut ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white">
            Sold Out
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#8d7f73]">{product.category}</p>
            <h3 className="text-lg font-semibold text-[#f5efe8]">{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[#f5efe8]">{formatINR(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-xs text-[#8d7f73] line-through">{formatINR(product.compareAtPrice)}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#2f2a27] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#c5b7a7]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
