import Image from "next/image";
import Link from "next/link";

import { GradientPanel } from "@/components/ui/gradient-panel";
import type { ProductCard as ProductCardType } from "@/lib/types";
import { formatINR, isSupabaseStorageUrl } from "@/lib/utils";

export function ProductCard({
  product,
  isPriority = false,
}: {
  product: ProductCardType;
  isPriority?: boolean;
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
              unoptimized={isSupabaseStorageUrl(primaryImage.url)}
              priority={isPriority}
            />
          </div>
        ) : (
          <GradientPanel
            palette={product.accent}
            className="aspect-[4/5] transition duration-700 group-hover:scale-[1.035]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45 opacity-80" />
        {product.soldOut ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white">
            Sold Out
          </span>
        ) : null}

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

      </div>
    </Link>
  );
}
