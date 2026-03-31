import type { ProductCard as ProductCardType } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({ products }: { products: ProductCardType[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
