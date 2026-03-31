import { NextResponse } from "next/server";
import { z } from "zod";

import { createRazorpayOrder } from "@/lib/services/commerce";
import { getCartSessionCookie, getOrCreateCartSession } from "@/lib/server/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncCustomerProfile } from "@/lib/services/customer-account";

const razorpaySchema = z.object({
  email: z.email(),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Enter a valid Indian phone number."),
  name: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code."),
  country: z.literal("India"),
  shippingMethod: z.literal("standard"),
  paymentMethod: z.literal("razorpay-test"),
});

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = getOrCreateCartSession(request.headers.get("cookie"));
    const payload = razorpaySchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (user) {
      await syncCustomerProfile(user);
    }

    const checkout = await createRazorpayOrder(sessionId, payload, user?.id);
    const response = NextResponse.json({ checkout });
    if (isNew) response.headers.set("Set-Cookie", getCartSessionCookie(sessionId));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start Razorpay checkout." },
      { status: 400 },
    );
  }
}
