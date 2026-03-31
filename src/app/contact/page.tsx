import { getStoreSettings } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Contact / Store locator</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Get in touch</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
          <h2 className="text-2xl tracking-[-0.04em] text-[#f5efe8]">Client services</h2>
          <p className="mt-4 leading-8 text-[#c7b9ab]">{settings.contactEmail}</p>
          <p className="leading-8 text-[#c7b9ab]">{settings.contactPhone}</p>
          <p className="mt-4 leading-8 text-[#9e9082]">{settings.contactHours}</p>
        </div>
        <div className="rounded-[2rem] border border-dashed border-[#38312d] p-6">
          <h2 className="text-2xl tracking-[-0.04em] text-[#f5efe8]">Store locations</h2>
          <p className="mt-4 leading-8 text-[#c7b9ab]">
            Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
