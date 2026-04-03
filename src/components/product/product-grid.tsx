import type { ProductCard as ProductCardType } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({
  products,
}: {
  products: ProductCardType[];
}) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} isPriority={index < 3} />
      ))}
    </div>
  );
}
