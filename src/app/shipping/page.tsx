import { getStoreSettings } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Shipping & Returns</p>
      <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">{settings.shippingTitle}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {[
          ["Shipping", `Standard shipping is free above Rs. ${settings.freeShippingThreshold.toLocaleString("en-IN")}. Orders below that threshold ship at Rs. ${settings.standardShippingFee}.`],
          ["Returns", "Eligible orders may be exchanged within 7 days. Refunds and return requests are reviewed once items reach the warehouse in original condition."],
          ["Taxes", "Prices can be displayed tax inclusive depending on configuration. Final totals are recalculated at checkout before payment."],
          ["International", "The architecture is ready for future region support, but this starter is optimized for India-first delivery and INR pricing."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
            <h2 className="text-2xl tracking-[-0.04em] text-[#f5efe8]">{title}</h2>
            <p className="mt-4 leading-8 text-[#c7b9ab]">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
