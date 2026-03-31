import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrderHistoryForUser } from "@/lib/services/customer-account";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const orders = await getOrderHistoryForUser(user);
  return NextResponse.json({ orders });
}
