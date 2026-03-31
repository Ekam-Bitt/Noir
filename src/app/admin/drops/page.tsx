import { AdminNav } from "@/components/admin/admin-nav";
import { DropAdminCard } from "@/components/admin/drop-admin-card";
import { DropCreateForm } from "@/components/admin/drop-create-form";
import { getCollectionStories } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export default async function AdminDropsPage() {
  const drops = await getCollectionStories();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Admin / Drops</p>
        <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8]">Collection storytelling and launches</h1>
        <AdminNav />
      </div>
      <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <DropCreateForm />
        <div className="space-y-6">
          {drops.map((drop) => (
            <DropAdminCard key={drop.slug} drop={drop} />
          ))}
        </div>
      </div>
    </div>
  );
}
