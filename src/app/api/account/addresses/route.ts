import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCustomerAddressForUser,
  getCustomerProfileForUser,
  syncCustomerProfile,
} from "@/lib/services/customer-account";

const addressSchema = z.object({
  name: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/),
  country: z.literal("India"),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  await syncCustomerProfile(user);
  const customer = await getCustomerProfileForUser(user);
  return NextResponse.json({ addresses: customer.addresses });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const payload = addressSchema.parse(await request.json());
    await createCustomerAddressForUser(user.id, payload);
    const customer = await getCustomerProfileForUser(user);
    return NextResponse.json({ addresses: customer.addresses });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create address." },
      { status: 400 },
    );
  }
}
