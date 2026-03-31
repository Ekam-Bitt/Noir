import { getFaqs } from "@/lib/services/content";
import { getStoreSettings } from "@/lib/services/content";

export default async function FAQPage() {
  const [items, settings] = await Promise.all([getFaqs(), getStoreSettings()]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">FAQ</p>
      <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">{settings.faqTitle}</h1>
      <div className="mt-10 space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-[1.75rem] border border-[#26211f] bg-[#120f0d] p-6">
            <h2 className="text-2xl tracking-[-0.04em] text-[#f5efe8]">{item.question}</h2>
            <p className="mt-3 leading-8 text-[#c7b9ab]">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
