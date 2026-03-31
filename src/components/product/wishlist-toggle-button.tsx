"use client";

import { useState } from "react";

export function WishlistToggleButton({ productId }: { productId: string }) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={async () => {
          setMessage(null);
          const response = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            setMessage(
              response.status === 401
                ? "Please sign in to save wishlist items."
                : (data.error ?? "Unable to update wishlist."),
            );
            return;
          }
          setMessage("Wishlist updated.");
        }}
        className="w-full rounded-full border border-[#352f2c] px-6 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#f5efe8]"
      >
        Add To Wishlist
      </button>
      {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
    </div>
  );
}
