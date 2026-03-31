"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Cart, ProductDetail } from "@/lib/types";

type AddPayload = {
  product: ProductDetail;
  variantId: string;
  quantity?: number;
};

type CartContextValue = {
  cart: Cart;
  isDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  refreshCart: () => Promise<void>;
  addItem: (payload: AddPayload) => Promise<string | null>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
};

const emptyCart: Cart = {
  id: "cart_pending",
  currency: "INR",
  lines: [],
  discountTotal: 0,
  shippingFee: 0,
  taxTotal: 0,
  subtotal: 0,
  grandTotal: 0,
};

const CartContext = createContext<CartContextValue | null>(null);

async function parseResponse(response: Response) {
  const data = (await response.json()) as { cart?: Cart; error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }
  return data;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const data = await parseResponse(response);
      setCart(data.cart ?? emptyCart);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isDrawerOpen,
      isLoading,
      error,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      refreshCart,
      addItem: async ({ variantId, quantity = 1 }) => {
        try {
          const response = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId, quantity }),
          });
          const data = await parseResponse(response);
          setCart(data.cart ?? emptyCart);
          setError(null);
          setDrawerOpen(true);
          return null;
        } catch (nextError) {
          const message = nextError instanceof Error ? nextError.message : "Unable to add item.";
          setError(message);
          return message;
        }
      },
      updateQuantity: async (lineId, quantity) => {
        try {
          const response = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineId, quantity }),
          });
          const data = await parseResponse(response);
          setCart(data.cart ?? emptyCart);
          setError(null);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to update quantity.");
        }
      },
      removeItem: async (lineId) => {
        try {
          const response = await fetch(`/api/cart?lineId=${lineId}`, {
            method: "DELETE",
          });
          const data = await parseResponse(response);
          setCart(data.cart ?? emptyCart);
          setError(null);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to remove item.");
        }
      },
      applyPromoCode: async (code) => {
        try {
          const response = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineId: "promo", promoCode: code.trim().toUpperCase() }),
          });
          const data = await parseResponse(response);
          setCart(data.cart ?? emptyCart);
          setError(null);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to apply promo code.");
        }
      },
    }),
    [cart, error, isDrawerOpen, isLoading],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
