import Image from "next/image";
import Link from "next/link";

import { GradientPanel } from "@/components/ui/gradient-panel";
import type { ProductCard as ProductCardType } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function ProductCard({
  product,
}: {
  product: ProductCardType;
}) {
  const primaryImage = product.primaryImage;

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-4">
      <div className="relative overflow-hidden bg-[#13100f]">
        {primaryImage?.url ? (
          <div className="relative aspect-[4/5] overflow-hidden bg-[#161210]">
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
            />
          </div>
        ) : (
          <GradientPanel
            palette={product.accent}
            label={product.collection}
            className="aspect-[4/5] transition duration-700 group-hover:scale-[1.035]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45 opacity-80" />
        {product.soldOut ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white">
            Sold Out
          </span>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 px-4 py-4 opacity-100 transition duration-500 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#d9c5b0]">{product.collection}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#f5efe8]">View product</p>
          </div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#f5efe8]">{formatINR(product.price)}</p>
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d7f73]">{product.category}</p>
            <h3 className="mt-2 text-[1.08rem] text-[#f5efe8]">{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#f5efe8]">{formatINR(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-xs text-[#8d7f73] line-through">{formatINR(product.compareAtPrice)}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] uppercase tracking-[0.24em] text-[#a99988]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
