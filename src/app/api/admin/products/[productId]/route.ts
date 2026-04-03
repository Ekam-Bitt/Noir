import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/services/commerce";

const imageSchema = z.object({
  id: z.string().min(2),
  label: z.string().min(2),
  palette: z.tuple([z.string(), z.string(), z.string()]),
  url: z.string().url().optional(),
  path: z.string().min(2).optional(),
  alt: z.string().min(2).optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum(["Men", "Women", "Unisex"]).optional(),
  subcategory: z.enum(["Tops", "Bottoms", "Accessories"]).optional(),
  status: z.enum(["draft", "active", "hidden"]).optional(),
  launchAt: z.string().datetime().nullable().optional(),
  price: z.number().int().nonnegative().optional(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  description: z.string().min(10).optional(),
  fit: z.enum(["Oversized", "Regular", "Relaxed"]).optional(),
  fabric: z.string().optional(),
  story: z.string().optional(),
  modelInfo: z.string().optional(),
  shippingNote: z.string().optional(),
  images: z.array(imageSchema).optional(),
  variantStock: z.record(z.string(), z.number().int().nonnegative()).optional(),
});

function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.join(".") || "field";
    return `${path}: ${issue.message}`;
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const { productId } = await params;
    const payload = updateSchema.parse(await request.json());
    const product = await updateAdminProduct(productId, {
      ...payload,
      compareAtPrice:
        payload.compareAtPrice === null ? undefined : payload.compareAtPrice,
    });
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const { productId } = await params;
    await deleteAdminProduct(productId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete product." },
      { status: 400 },
    );
  }
}
