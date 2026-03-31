import { ProductGrid } from "@/components/product/product-grid";
import { requireAuthenticatedViewer } from "@/lib/auth/server";
import { getWishlistProductsForUser, syncCustomerProfile } from "@/lib/services/customer-account";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const viewer = await requireAuthenticatedViewer("/wishlist");
  await syncCustomerProfile(viewer.user);
  const products = await getWishlistProductsForUser(viewer.user);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Wishlist</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Wishlist</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#c7b9ab]">
          Wishlist items are stored against your signed-in customer profile so they persist across devices.
        </p>
      </div>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="rounded-[2rem] border border-dashed border-[#2f2926] px-6 py-16 text-center">
          <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">No saved items yet.</p>
          <p className="mt-3 text-[#a7988b]">Save products you like and come back to them later.</p>
        </div>
      )}
    </div>
  );
}
