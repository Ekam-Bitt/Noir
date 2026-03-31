import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug, getRecommendedProducts } from "@/lib/services/commerce";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const recommendations = await getRecommendedProducts(product.slug);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetail product={product} recommendations={recommendations} />
    </div>
  );
}
