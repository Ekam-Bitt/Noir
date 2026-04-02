import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { createAdminProduct, getAdminProducts } from "@/lib/services/commerce";

const imageSchema = z.object({
  id: z.string().min(2),
  label: z.string().min(2),
  palette: z.tuple([z.string(), z.string(), z.string()]),
  url: z.string().url().optional(),
  path: z.string().min(2).optional(),
  alt: z.string().min(2).optional(),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.enum(["Men", "Women", "Unisex"]),
  subcategory: z.enum(["Tops", "Bottoms", "Accessories"]),
  collection: z.string().min(2),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional(),
  description: z.string().min(10),
  fit: z.enum(["Oversized", "Regular", "Relaxed"]),
  fabric: z.string().min(2),
  story: z.string().min(10),
  modelInfo: z.string().min(2),
  shippingNote: z.string().min(2),
  colors: z.array(z.string().min(1)).min(1),
  sizes: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1),
  initialStock: z.number().int().nonnegative(),
  images: z.array(imageSchema).optional(),
});

export async function GET() {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  const products = await getAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  try {
    const payload = productSchema.parse(await request.json());
    const product = await createAdminProduct(payload);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product." },
      { status: 400 },
    );
  }
}
