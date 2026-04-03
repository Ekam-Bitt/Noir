import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiAccess } from "@/lib/auth/api";
import {
  createCollectionStory,
  getAdminCollectionStories,
} from "@/lib/services/content";
import { syncProductsForDrop } from "@/lib/services/commerce";

const dropSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  chapterNumber: z.string().min(1),
  intro: z.string().min(1),
  narrative: z.string().min(1),
  mood: z.string().min(1),
  featuredProductSlugs: z.array(z.string().min(2)),
  image: z.string().url().optional(),
  launchAt: z.string().datetime().nullable().optional(),
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
  isArchived: z.boolean().optional(),
});

export async function GET() {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  const drops = await getAdminCollectionStories();
  return NextResponse.json({ drops });
}

export async function POST(request: Request) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const payload = dropSchema.parse(await request.json());
    const normalizedPayload = {
      ...payload,
      launchAt: payload.launchAt ?? undefined,
    };
    const drop = await createCollectionStory(normalizedPayload);
    await syncProductsForDrop({
      title: normalizedPayload.title,
      launchAt: normalizedPayload.launchAt,
      selectedProductSlugs: normalizedPayload.featuredProductSlugs,
      archive: normalizedPayload.isArchived,
    });
    return NextResponse.json({ drop });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create drop." },
      { status: 400 },
    );
  }
}
