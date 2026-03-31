const CART_COOKIE = "noir_cart_session";

export function getOrCreateCartSession(cookieHeader?: string | null) {
  const cookieValue = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_COOKIE}=`))
    ?.split("=")[1];

  if (cookieValue) {
    return { sessionId: cookieValue, isNew: false };
  }

  return { sessionId: crypto.randomUUID(), isNew: true };
}

export function getCartSessionCookie(sessionId: string) {
  return `${CART_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}
