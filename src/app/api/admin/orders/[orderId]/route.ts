import { NextResponse } from "next/server";
import { z } from "zod";

import { updateAdminOrder } from "@/lib/services/commerce";

const orderSchema = z.object({
  paymentStatus: z.enum(["paid", "pending", "failed", "refunded"]).optional(),
  fulfillmentStatus: z.enum(["processing", "shipped", "delivered", "returned"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const payload = orderSchema.parse(await request.json());
    const order = await updateAdminOrder(orderId, payload);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order." },
      { status: 400 },
    );
  }
}
