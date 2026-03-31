import { AdminNav } from "@/components/admin/admin-nav";
import { OrderAdminCard } from "@/components/admin/order-admin-card";
import { getAdminOrders } from "@/lib/services/commerce";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Admin / Orders</p>
        <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8]">Order operations</h1>
        <AdminNav />
      </div>

      <div className="space-y-6">
        {orders.length ? (
          orders.map((order) => <OrderAdminCard key={order.id} order={order} />)
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#2f2926] px-6 py-16 text-center">
            <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">No orders yet.</p>
            <p className="mt-3 text-[#a7988b]">Place a test order from the storefront and it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
