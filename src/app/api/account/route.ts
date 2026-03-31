import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCustomerProfileForUser, getOrderHistoryForUser, syncCustomerProfile } from "@/lib/services/customer-account";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  await syncCustomerProfile(user);
  const [customer, orders] = await Promise.all([getCustomerProfileForUser(user), getOrderHistoryForUser(user)]);
  return NextResponse.json({ customer, orders });
}
