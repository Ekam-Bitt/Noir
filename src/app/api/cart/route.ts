import { NextResponse } from "next/server";
import { z } from "zod";

import {
  addCartItem,
  applyCartPromoCode,
  getCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/services/commerce";
import { getCartSessionCookie, getOrCreateCartSession } from "@/lib/server/session";

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
});

const updateSchema = z.object({
  lineId: z.string().min(1),
  quantity: z.number().int().min(0).max(10).optional(),
  promoCode: z.string().optional(),
});

export async function GET(request: Request) {
  const { sessionId, isNew } = getOrCreateCartSession(request.headers.get("cookie"));
  const cart = await getCart(sessionId);
  const response = NextResponse.json({ cart });
  if (isNew) response.headers.set("Set-Cookie", getCartSessionCookie(sessionId));
  return response;
}

export async function POST(request: Request) {
  try {
    const { sessionId, isNew } = getOrCreateCartSession(request.headers.get("cookie"));
    const payload = addSchema.parse(await request.json());
    const cart = await addCartItem(sessionId, payload.variantId, payload.quantity);
    const response = NextResponse.json({ cart });
    if (isNew) response.headers.set("Set-Cookie", getCartSessionCookie(sessionId));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to add item." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { sessionId, isNew } = getOrCreateCartSession(request.headers.get("cookie"));
    const payload = updateSchema.parse(await request.json());

    const cart =
      typeof payload.promoCode === "string"
        ? await applyCartPromoCode(sessionId, payload.promoCode)
        : await updateCartLine(sessionId, payload.lineId, payload.quantity ?? 1);

    const response = NextResponse.json({ cart });
    if (isNew) response.headers.set("Set-Cookie", getCartSessionCookie(sessionId));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update cart." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { sessionId, isNew } = getOrCreateCartSession(request.headers.get("cookie"));
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");

    if (!lineId) {
      return NextResponse.json({ error: "lineId is required." }, { status: 400 });
    }

    const cart = await removeCartLine(sessionId, lineId);
    const response = NextResponse.json({ cart });
    if (isNew) response.headers.set("Set-Cookie", getCartSessionCookie(sessionId));
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to remove line." },
      { status: 400 },
    );
  }
}
