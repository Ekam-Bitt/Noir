import { AdminNav } from "@/components/admin/admin-nav";
import { SettingsForm } from "@/components/admin/settings-form";
import { getStoreSettings } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Admin / Settings</p>
        <h1 className="text-6xl tracking-[-0.05em] text-[#f5efe8]">Brand and storefront settings</h1>
        <AdminNav />
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
