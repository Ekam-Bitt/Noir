import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/api";
import { getAdminOrders } from "@/lib/services/commerce";

export async function GET() {
  const denied = await requireAdminApiAccess();
  if (denied) return denied;
  const orders = await getAdminOrders();
  return NextResponse.json({ orders });
}
