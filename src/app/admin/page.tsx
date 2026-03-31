import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminDashboard } from "@/lib/services/commerce";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminDashboard();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Admin</p>
        <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8]">Local operations panel</h1>
        <AdminNav />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Products", String(stats.totalProducts)],
          ["Orders", String(stats.totalOrders)],
          ["Revenue", formatINR(stats.revenue)],
          ["Inventory units", String(stats.inventoryUnits)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">{label}</p>
            <p className="mt-4 text-4xl tracking-[-0.04em] text-[#f5efe8]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
