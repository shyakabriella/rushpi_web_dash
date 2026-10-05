"use client";

export type CartItem = {
  productId: string;
  name: string;
  image?: string;
  price?: number | string;
  currency?: string;
  quantity: number;
};

export const CART_KEY = "rushpi_cart";
export const CART_EVENT = "rushpi-cart-updated";

export function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(CART_KEY) ?? "[]",
    );

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored
      .filter(
        (item): item is CartItem =>
          item &&
          typeof item.productId === "string" &&
          typeof item.name === "string",
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify(items),
  );

  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  quantity = 1,
): CartItem[] {
  const items = getStoredCart();

  const existingIndex = items.findIndex(
    (existing) => existing.productId === item.productId,
  );

  let nextItems: CartItem[];

  if (existingIndex >= 0) {
    nextItems = items.map((existing, index) =>
      index === existingIndex
        ? {
            ...existing,
            quantity: existing.quantity + quantity,
          }
        : existing,
    );
  } else {
    nextItems = [...items, { ...item, quantity }];
  }

  saveCart(nextItems);

  return nextItems;
}

export function getCartCount(items?: CartItem[]): number {
  const list = items ?? getStoredCart();

  return list.reduce(
    (total, item) => total + item.quantity,
    0,
  );
}
