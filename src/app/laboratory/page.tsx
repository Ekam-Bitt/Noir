import { getFeaturedCollectionStories, getStoreSettings } from "@/lib/services/content";
import { GradientPanel } from "@/components/ui/gradient-panel";

export const dynamic = "force-dynamic";

export default async function LaboratoryPage() {
  const [settings, stories] = await Promise.all([
    getStoreSettings(),
    getFeaturedCollectionStories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 max-w-4xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">{settings.laboratoryTitle}</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Experimental drops and future directions.</h1>
        <p className="mt-6 text-base leading-8 text-[#c7b9ab]">{settings.laboratoryBody}</p>
      </div>
      {stories.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <div key={story.slug} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-5">
              <GradientPanel palette={["#1a1614", "#120f0d", "#26211f"]} label={`Chapter ${story.chapterNumber}`} className="aspect-[4/5]" />
              <h2 className="mt-5 text-3xl tracking-[-0.04em] text-[#f5efe8]">{story.title}</h2>
              <p className="mt-3 leading-8 text-[#c7b9ab]">{story.intro}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">In development</p>
          <p className="mt-4 text-3xl tracking-[-0.05em] text-[#f5efe8]">Experimental drops are not live yet.</p>
        </div>
      )}
    </div>
  );
}
