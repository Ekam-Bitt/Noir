import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteAdminProduct, updateAdminProduct } from "@/lib/services/commerce";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum(["Men", "Women", "Unisex"]).optional(),
  subcategory: z.enum(["Tops", "Bottoms", "Accessories"]).optional(),
  collection: z.string().min(2).optional(),
  price: z.number().int().nonnegative().optional(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  description: z.string().min(10).optional(),
  fit: z.enum(["Oversized", "Regular", "Relaxed"]).optional(),
  fabric: z.string().min(2).optional(),
  story: z.string().min(10).optional(),
  modelInfo: z.string().min(2).optional(),
  shippingNote: z.string().min(2).optional(),
  variantStock: z.record(z.string(), z.number().int().nonnegative()).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
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
