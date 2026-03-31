import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWishlistProductsForUser, syncCustomerProfile, toggleWishlistProductForUser } from "@/lib/services/customer-account";

const wishlistSchema = z.object({
  productId: z.string().min(1),
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
  const wishlist = await getWishlistProductsForUser(user);
  return NextResponse.json({ wishlist });
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (!user) {
      return NextResponse.json({ error: "Please sign in to use wishlist." }, { status: 401 });
    }

    await syncCustomerProfile(user);
    const payload = wishlistSchema.parse(await request.json());
    const wishlist = await toggleWishlistProductForUser(user, payload.productId);
    return NextResponse.json({ wishlist });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update wishlist." },
      { status: 400 },
    );
  }
}
