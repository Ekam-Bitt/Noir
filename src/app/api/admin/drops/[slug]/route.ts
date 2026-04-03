import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { deleteCollectionStory, getAdminCollectionStories, updateCollectionStory } from "@/lib/services/content";
import { syncProductsForDrop } from "@/lib/services/commerce";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  chapterNumber: z.string().min(1).optional(),
  intro: z.string().min(10).optional(),
  narrative: z.string().min(10).optional(),
  mood: z.string().min(2).optional(),
  palette: z.tuple([z.string(), z.string(), z.string()]).optional(),
  featuredProductSlugs: z.array(z.string().min(2)).optional(),
  image: z.string().url().optional(),
  launchAt: z.string().datetime().nullable().optional(),
  isVisible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const { slug } = await params;
    const current = (await getAdminCollectionStories()).find((story) => story.slug === slug);
    if (!current) {
      return NextResponse.json({ error: "Drop not found." }, { status: 404 });
    }
    const payload = updateSchema.parse(await request.json());
    const normalizedPayload = {
      ...payload,
      launchAt: payload.launchAt ?? undefined,
    };
    const drop = await updateCollectionStory(slug, normalizedPayload);
    await syncProductsForDrop({
      title: drop.title,
      launchAt: drop.launchAt,
      selectedProductSlugs: drop.featuredProductSlugs,
      previousProductSlugs: current.featuredProductSlugs,
      archive: drop.isArchived,
    });
    return NextResponse.json({ drop });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update drop." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const { slug } = await params;
    await deleteCollectionStory(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete drop." },
      { status: 400 },
    );
  }
}
