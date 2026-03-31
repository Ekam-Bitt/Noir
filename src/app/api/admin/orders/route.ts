import { NextResponse } from "next/server";

import { getAdminOrders } from "@/lib/services/commerce";

export async function GET() {
  const orders = await getAdminOrders();
  return NextResponse.json({ orders });
}
