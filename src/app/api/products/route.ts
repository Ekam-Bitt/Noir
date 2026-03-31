import { NextResponse } from "next/server";

import { listProducts } from "@/lib/services/commerce";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await listProducts({
    category: searchParams.get("category") ?? undefined,
    subcategory: searchParams.get("subcategory") ?? undefined,
    color: searchParams.get("color") ?? undefined,
    size: searchParams.get("size") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  return NextResponse.json({ products });
}
