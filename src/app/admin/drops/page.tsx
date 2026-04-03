import { AdminNav } from "@/components/admin/admin-nav";
import { DropAdminCard } from "@/components/admin/drop-admin-card";
import { DropCreateForm } from "@/components/admin/drop-create-form";
import { getAdminCollectionStories } from "@/lib/services/content";
import { getAdminProducts } from "@/lib/services/commerce";

export const dynamic = "force-dynamic";

export default async function AdminDropsPage() {
  const [drops, products] = await Promise.all([getAdminCollectionStories(), getAdminProducts()]);

  // Filter products for the "Create Drop" inventory:
  // Show only Live (active) and Archive (hidden) products not associated with any drop.
  const dropProductSlugs = new Set(drops.flatMap((d) => d.featuredProductSlugs));
  const availableForNewDrop = products.filter(
    (p) => !dropProductSlugs.has(p.slug),
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Admin / Drops</p>
        <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8]">Drops, scheduling, and archive</h1>
        <p className="max-w-3xl text-sm text-[#ab9d90]">
          Build collections from existing products, schedule launches, and move past drops into archive without deleting them.
        </p>
        <AdminNav />
      </div>
      <div className="grid items-start gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <DropCreateForm products={availableForNewDrop} />
        <div className="space-y-6">
          {drops.map((drop) => {
            // For existing drops, we show the products currently in the drop PLUS available ones
            const otherDropSlugs = new Set(
              drops.filter((d) => d.slug !== drop.slug).flatMap((d) => d.featuredProductSlugs),
            );
            const selectableForThisDrop = products.filter(
              (p) => p.status !== "draft" && !otherDropSlugs.has(p.slug),
            );

            return (
              <DropAdminCard
                key={drop.slug}
                drop={drop}
                products={selectableForThisDrop}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
