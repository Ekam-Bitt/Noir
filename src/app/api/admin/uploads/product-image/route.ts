import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { uploadProductImage } from "@/lib/server/product-images";

export async function POST(request: Request) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const productSlug = String(formData.get("productSlug") ?? "").trim();
    const label = String(formData.get("label") ?? "").trim();
    const file = formData.get("file");

    if (!productSlug) {
      return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const image = await uploadProductImage({ productSlug, file, label });
    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload product image." },
      { status: 400 },
    );
  }
}
