import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { uploadCollectionImage } from "@/lib/server/product-images";

export async function POST(request: Request) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
    const file = formData.get("file");

    if (!collectionSlug) {
      return NextResponse.json({ error: "Collection slug is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const image = await uploadCollectionImage({ collectionSlug, file });
    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload collection image." },
      { status: 400 },
    );
  }
}
