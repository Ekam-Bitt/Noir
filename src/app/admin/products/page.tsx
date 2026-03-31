import { AdminNav } from "@/components/admin/admin-nav";
import { ProductAdminCard } from "@/components/admin/product-admin-card";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { getAdminProducts } from "@/lib/services/commerce";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = (await getAdminProducts()) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Admin / Products</p>
        <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8]">Catalogue management</h1>
        <AdminNav />
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <ProductCreateForm />
        <div className="space-y-6">
          {products.map((product) => (
            <ProductAdminCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
