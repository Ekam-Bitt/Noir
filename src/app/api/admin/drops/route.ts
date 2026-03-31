import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createCollectionStory,
  getCollectionStories,
} from "@/lib/services/content";

const dropSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  eyebrow: z.string().min(2),
  intro: z.string().min(10),
  narrative: z.string().min(10),
  mood: z.string().min(2),
  palette: z.tuple([z.string(), z.string(), z.string()]),
  featuredProductSlugs: z.array(z.string().min(2)),
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
});

export async function GET() {
  const drops = await getCollectionStories();
  return NextResponse.json({ drops });
}

export async function POST(request: Request) {
  try {
    const payload = dropSchema.parse(await request.json());
    const drop = await createCollectionStory(payload);
    return NextResponse.json({ drop });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create drop." },
      { status: 400 },
    );
  }
}
