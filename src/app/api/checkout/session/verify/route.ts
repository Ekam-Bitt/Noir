import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyRazorpayPayment } from "@/lib/services/commerce";
import { getCartSessionCookie, getOrCreateCartSession } from "@/lib/server/session";

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = getOrCreateCartSession(request.headers.get("cookie"));
    const payload = verifySchema.parse(await request.json());
    const order = await verifyRazorpayPayment(sessionId, payload);
    const response = NextResponse.json({ order });
    if (isNew) response.headers.set("Set-Cookie", getCartSessionCookie(sessionId));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 400 },
    );
  }
}
