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
  status: z.enum(["draft", "active", "hidden"]),
  launchAt: z.string().datetime().optional(),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional(),
  description: z.string().min(10),
  fit: z.enum(["Oversized", "Regular", "Relaxed"]),
  fabric: z.string(),
  story: z.string().optional(),
  modelInfo: z.string(),
  shippingNote: z.string(),
  colors: z.array(z.string().min(1)).min(1),
  sizes: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1),
  initialStock: z.number().int().nonnegative(),
  images: z.array(imageSchema).optional(),
});

function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.join(".") || "field";
    if (path === "modelInfo") return "Model info can be left blank.";
    if (path === "shippingNote") return "Shipping note can be left blank.";
    return `${path}: ${issue.message}`;
  });
}

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product." },
      { status: 400 },
    );
  }
}
