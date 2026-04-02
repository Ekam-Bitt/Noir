import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { updateCollectionStory } from "@/lib/services/content";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  eyebrow: z.string().min(2).optional(),
  intro: z.string().min(10).optional(),
  narrative: z.string().min(10).optional(),
  mood: z.string().min(2).optional(),
  palette: z.tuple([z.string(), z.string(), z.string()]).optional(),
  featuredProductSlugs: z.array(z.string().min(2)).optional(),
  isVisible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const { slug } = await params;
    const payload = updateSchema.parse(await request.json());
    const drop = await updateCollectionStory(slug, payload);
    return NextResponse.json({ drop });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update drop." },
      { status: 400 },
    );
  }
}
